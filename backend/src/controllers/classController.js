const Class = require('../models/Class');
const Booking = require('../models/Booking');

// @desc    Obtener todas las clases
// @route   GET /api/classes
// @access  Public
exports.getClasses = async (req, res) => {
  try {
    const { discipline, dayOfWeek, level, isActive } = req.query;

    // Construir filtro
    const filter = {};
    if (discipline) filter.discipline = discipline;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (level) filter.level = level;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classes = await Class.find(filter).sort({ dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una clase por ID
// @route   GET /api/classes/:id
// @access  Public
exports.getClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Crear nueva clase
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    // Calcular capacidad máxima según el salón
    const maxCapacity = req.body.salon === 1 ? 25 : 12;

    const classData = await Class.create({
      ...req.body,
      maxCapacity
    });

    res.status(201).json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar clase
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res) => {
  try {
    let classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Si se cambia el salón, actualizar capacidad
    if (req.body.salon && req.body.salon !== classData.salon) {
      req.body.maxCapacity = req.body.salon === 1 ? 25 : 12;
    }

    classData = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar clase
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Clase no encontrada'
      });
    }

    // Verificar si hay reservas activas
    const activeBookings = await Booking.countDocuments({
      class: req.params.id,
      status: 'confirmed',
      date: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una clase con reservas activas'
      });
    }

    await classData.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Clase eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener horario semanal completo
// @route   GET /api/classes/schedule/weekly
// @access  Public
exports.getWeeklySchedule = async (req, res) => {
  try {
    const schedule = await Class.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$dayOfWeek',
          classes: {
            $push: {
              id: '$_id',
              name: '$name',
              discipline: '$discipline',
              teacher: '$teacher',
              startTime: '$startTime',
              endTime: '$endTime',
              salon: '$salon',
              level: '$level',
              ageGroup: '$ageGroup',
              availableSpots: { $subtract: ['$maxCapacity', '$currentEnrollment'] }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
