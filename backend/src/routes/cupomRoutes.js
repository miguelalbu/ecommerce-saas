// src/routes/cupomRoutes.js
const express = require('express');
const router = express.Router();
const cupomController = require('../controllers/cupomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Público: validar cupom no checkout
router.post('/validate', cupomController.validateCupom);

// Admin: CRUD
router.get('/', protect, authorize('ADMIN'), cupomController.getAllCupons);
router.post('/', protect, authorize('ADMIN'), cupomController.createCupom);
router.put('/:id', protect, authorize('ADMIN'), cupomController.updateCupom);
router.delete('/:id', protect, authorize('ADMIN'), cupomController.deleteCupom);

module.exports = router;
