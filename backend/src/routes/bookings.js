const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  cancelBooking,
  markAttendance,
  getBookingStats
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// Rutas de estudiante
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Rutas de admin
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id/attendance', protect, adminOnly, markAttendance);
router.get('/stats/overview', protect, adminOnly, getBookingStats);

module.exports = router;
