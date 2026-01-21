const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getOverviewStats
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Todas las rutas son solo para admin
router.use(protect);
router.use(adminOnly);

router.get('/', getAllUsers);
router.get('/stats/overview', getOverviewStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
