const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/orders -> Rota protegida para listar todos os pedidos
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);

module.exports = router;