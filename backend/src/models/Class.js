const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa el nombre de la clase'],
    trim: true
  },
  discipline: {
    type: String,
    required: [true, 'Por favor selecciona la disciplina'],
    enum: [
      'BALLET MINI',
      'ACRO DANCE',
      'JAZZ TEEN',
      'URBANO PRINCIPIANTES ADULTOS',
      'URBANO INTERMEDIO ADULTOS',
      'JAZZ ADULTOS PRIN-INTERMEDIO',
      'HEELS ADULTOS INTERMEDIO',
      'URBANO/REGGAETON INTERMEDIO/AVANZADO',
      'URBANO TEENS',
      'HIP HOP MINI',
      'K-POP TEEN'
    ]
  },
  ageGroup: {
    type: String,
    required: true,
    enum: ['4-8 años', '9-15 años', '15+ años', 'adultos']
  },
  level: {
    type: String,
    required: true,
    enum: ['principiante', 'intermedio', 'avanzado', 'intermedio/avanzado']
  },
  teacher: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del maestro/a'],
    trim: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  },
  startTime: {
    type: String,
    required: [true, 'Por favor ingresa la hora de inicio'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Por favor ingresa la hora de fin'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  duration: {
    type: Number, // en minutos
    required: true
  },
  salon: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  maxCapacity: {
    type: Number,
    required: true
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Por favor ingresa el precio de la clase']
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
classSchema.index({ dayOfWeek: 1, startTime: 1, salon: 1 }, { unique: true });

// Virtual para verificar si hay cupo disponible
classSchema.virtual('hasAvailableSpots').get(function() {
  return this.currentEnrollment < this.maxCapacity;
});

// Virtual para obtener spots disponibles
classSchema.virtual('availableSpots').get(function() {
  return this.maxCapacity - this.currentEnrollment;
});

module.exports = mongoose.model('Class', classSchema);
