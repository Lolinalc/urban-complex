const Booking = require('../models/Booking');
const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Crear nueva reserva
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { classId, date } = req.body;

    // Verificar que la clase existe
    const classData = await Class.findById(classId);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Verificar que la clase está activa
    if (!classData.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Esta clase no está disponible'
      });
    }

    // Verificar que hay cupo disponible
    if (classData.currentEnrollment >= classData.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'No hay cupo disponible para esta clase'
      });
    }

    // Verificar que no hay reserva duplicada
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      class: classId,
      date: new Date(date),
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una reserva para esta clase en esta fecha'
      });
    }

    // Crear reserva
    const booking = await Booking.create({
      user: req.user._id,
      class: classId,
      date: new Date(date)
    });

    // Actualizar enrollment de la clase
    classData.currentEnrollment += 1;
    await classData.save();

    // Poblar datos para respuesta
    await booking.populate('class', 'name discipline teacher startTime endTime salon');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener reservas del usuario
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['confirmed'] };
    }

    const bookings = await Booking.find(filter)
      .populate('class', 'name discipline teacher startTime endTime salon dayOfWeek')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todas las reservas (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, classId, date, userId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (classId) filter.class = classId;
    if (userId) filter.user = userId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('class', 'name discipline teacher startTime endTime salon')
      .populate('payment')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una reserva por ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('class', 'name discipline teacher startTime endTime salon dayOfWeek')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario puede ver esta reserva
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta reserva'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar reserva
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('class');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que el usuario puede cancelar esta reserva
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para cancelar esta reserva'
      });
    }

    // Verificar que la reserva no está ya cancelada
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya está cancelada'
      });
    }

    // Verificar que la clase no ha pasado
    if (booking.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una reserva de una clase pasada'
      });
    }

    // Actualizar reserva
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || 'Cancelado por el usuario';
    await booking.save();

    // Actualizar enrollment de la clase
    const classData = await Class.findById(booking.class._id);
    if (classData.currentEnrollment > 0) {
      classData.currentEnrollment -= 1;
      await classData.save();
    }

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Reserva cancelada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marcar asistencia (Admin)
// @route   PUT /api/bookings/:id/attendance
// @access  Private/Admin
exports.markAttendance = async (req, res) => {
  try {
    const { attended } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    booking.attended = attended;
    if (attended) {
      booking.status = 'completed';
    } else {
      booking.status = 'no-show';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de reservas (Admin)
// @route   GET /api/bookings/stats/overview
// @access  Private/Admin
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const upcomingBookings = await Booking.countDocuments({
      status: 'confirmed',
      date: { $gte: new Date() }
    });

    // Clases más populares
    const popularClasses = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      { $unwind: '$classInfo' },
      {
        $project: {
          className: '$classInfo.name',
          discipline: '$classInfo.discipline',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        upcomingBookings,
        popularClasses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
