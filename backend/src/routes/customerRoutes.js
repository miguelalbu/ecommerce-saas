// /backend/src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  registerCustomerSchema,
  loginCustomerSchema,
  addressSchema,
  updateProfileSchema,
} = require('../validators/userValidators');

// Rotas públicas
router.post('/register', validate(registerCustomerSchema), customerController.registerCustomer);
router.post('/login', validate(loginCustomerSchema), customerController.loginCustomer);

// Rotas protegidas para clientes autenticados
router.get('/profile', protect, authorize('CUSTOMER'), customerController.getProfile);
router.patch('/profile', protect, authorize('CUSTOMER'), validate(updateProfileSchema), customerController.updateProfile);
router.get('/addresses', protect, authorize('CUSTOMER'), customerController.getAddresses);
router.post('/addresses', protect, authorize('CUSTOMER'), validate(addressSchema), customerController.addAddress);
router.delete('/addresses/:id', protect, authorize('CUSTOMER'), customerController.deleteAddress);
router.patch('/addresses/:id/principal', protect, authorize('CUSTOMER'), customerController.setPrincipalAddress);

module.exports = router;
