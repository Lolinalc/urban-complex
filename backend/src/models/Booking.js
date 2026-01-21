const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  attended: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas rápidas
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ class: 1, date: 1 });
bookingSchema.index({ status: 1 });

// Evitar reservas duplicadas
bookingSchema.index({ user: 1, class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
