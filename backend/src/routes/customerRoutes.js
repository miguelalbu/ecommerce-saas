// /backend/src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rota pública para um novo cliente se cadastrar/logar
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);

// Rotas protegidas para clientes autenticados

router.get('/profile', protect, authorize('CUSTOMER'), customerController.getProfile);
router.get('/addresses', protect, authorize('CUSTOMER'), customerController.getAddresses);
router.post('/addresses', protect, authorize('CUSTOMER'), customerController.addAddress);

module.exports = router;