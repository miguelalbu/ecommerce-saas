const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rota protegida, apenas para admins, que retorna o resumo
router.get('/summary', protect, authorize('ADMIN'), dashboardController.getSummary);

module.exports = router;