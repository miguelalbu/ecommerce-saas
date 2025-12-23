const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my-orders', protect, orderController.getMyOrders);

// --- Rotas de Administrador ---
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);
router.post('/', protect, authorize('ADMIN'), orderController.createOrder);

router.get('/:id', protect, orderController.getOrderById); 

module.exports = router;