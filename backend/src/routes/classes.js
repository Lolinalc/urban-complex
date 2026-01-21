const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getWeeklySchedule
} = require('../controllers/classController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getClasses);
router.get('/schedule/weekly', getWeeklySchedule);
router.get('/:id', getClass);

// Rutas protegidas de admin
router.post('/', protect, adminOnly, createClass);
router.put('/:id', protect, adminOnly, updateClass);
router.delete('/:id', protect, adminOnly, deleteClass);

module.exports = router;
