const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Crear Payment Intent de Stripe
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, bookingIds, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    // Verificar que las reservas existen y pertenecen al usuario
    if (bookingIds && bookingIds.length > 0) {
      const bookings = await Booking.find({
        _id: { $in: bookingIds },
        user: req.user._id
      });

      if (bookings.length !== bookingIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunas reservas no son válidas'
        });
      }
    }

    // Obtener o crear cliente de Stripe
    let stripeCustomerId = req.user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: {
          userId: req.user._id.toString()
        }
      });

      stripeCustomerId = customer.id;

      // Guardar ID del cliente en el usuario
      await User.findByIdAndUpdate(req.user._id, {
        stripeCustomerId: customer.id
      });
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      customer: stripeCustomerId,
      description: description || 'Pago de clases - Urban Complex',
      metadata: {
        userId: req.user._id.toString(),
        bookingIds: bookingIds ? bookingIds.join(',') : ''
      }
    });

    // Crear registro de pago en la base de datos
    const payment = await Payment.create({
      user: req.user._id,
      amount,
      currency: 'usd',
      paymentMethod: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      description,
      bookings: bookingIds || []
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirmar pago exitoso
// @route   POST /api/payments/:id/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Verificar que el pago pertenece al usuario
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Verificar el estado del Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id;

      // Actualizar las reservas asociadas con el pago
      if (payment.bookings && payment.bookings.length > 0) {
        await Booking.updateMany(
          { _id: { $in: payment.bookings } },
          { payment: payment._id }
        );
      }

      await payment.save();

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Pago confirmado exitosamente'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'El pago aún no ha sido completado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Webhook de Stripe
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;

      // Actualizar el pago en la base de datos
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          status: 'completed',
          completedAt: new Date(),
          stripeChargeId: paymentIntent.charges.data[0]?.id
        }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;

      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: failedIntent.id },
        { status: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Obtener historial de pagos del usuario
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('bookings')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los pagos (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status, userId, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('bookings')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener un pago por ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'bookings',
        populate: {
          path: 'class',
          select: 'name discipline teacher startTime'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Verificar autorización
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Registrar pago manual (Admin)
// @route   POST /api/payments/manual
// @access  Private/Admin
exports.createManualPayment = async (req, res) => {
  try {
    const { userId, amount, paymentMethod, description, bookingIds } = req.body;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const payment = await Payment.create({
      user: userId,
      amount,
      paymentMethod,
      description,
      status: 'completed',
      completedAt: new Date(),
      bookings: bookingIds || []
    });

    // Actualizar las reservas asociadas
    if (bookingIds && bookingIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        { payment: payment._id }
      );
    }

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de pagos (Admin)
// @route   GET /api/payments/stats/overview
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    // Ingresos por mes
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayments,
        completedPayments,
        failedPayments,
        monthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
