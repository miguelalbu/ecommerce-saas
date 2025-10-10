// /backend/src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Rota pública para um novo cliente se cadastrar
router.post('/register', customerController.registerCustomer);

// Rota pública para um cliente fazer login
router.post('/login', customerController.loginCustomer);

module.exports = router;