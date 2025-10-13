const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/orders -> Rota protegida para listar todos os pedidos
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);
router.post('/', protect, authorize('ADMIN'), orderController.createOrder);
router.get('/:id', protect, authorize('ADMIN'), orderController.getOrderById);

module.exports = router;