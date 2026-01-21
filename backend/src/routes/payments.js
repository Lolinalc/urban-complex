const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getMyPayments,
  getAllPayments,
  getPayment,
  createManualPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

// Webhook de Stripe (debe estar antes de express.json())
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Rutas de estudiante
router.post('/create-intent', protect, createPaymentIntent);
router.post('/:id/confirm', protect, confirmPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/:id', protect, getPayment);

// Rutas de admin
router.get('/', protect, adminOnly, getAllPayments);
router.post('/manual', protect, adminOnly, createManualPayment);
router.get('/stats/overview', protect, adminOnly, getPaymentStats);

module.exports = router;
