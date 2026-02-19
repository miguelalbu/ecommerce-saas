const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const validate = require('../middleware/validate');
const { createUserSchema, loginUserSchema } = require('../validators/userValidators');
const { protect, authorize } = require('../middleware/authMiddleware');

// Pública: qualquer um pode fazer login
router.post('/login', validate(loginUserSchema), userController.loginUser);

// Protegida: apenas admin autenticado pode criar outro admin
router.post('/', protect, authorize('ADMIN'), validate(createUserSchema), userController.createUser);

module.exports = router;