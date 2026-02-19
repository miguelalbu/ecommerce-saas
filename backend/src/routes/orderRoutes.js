const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rotas de Usuário (Apenas autenticado)
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById); // Usuário vê o próprio, Admin vê qualquer um (Logica no Controller)

// --- Rotas de Administrador (Segurança Reforçada) ---
// Apenas Admin pode ver TODAS as ordens
router.get('/', protect, authorize('ADMIN'), orderController.getAllOrders);

// Apenas Admin pode criar pedido manualmente por essa rota (Checkout é em outra rota)
router.post('/', protect, authorize('ADMIN'), orderController.createOrder);

// Apenas Admin pode atualizar status e código de rastreio
router.put('/:id', protect, authorize('ADMIN'), orderController.updateOrder);

module.exports = router;