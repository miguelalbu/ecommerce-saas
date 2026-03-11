const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Leitura pública (usado no formulário de nova venda)
router.get('/', lojaController.getAllLojas);

// Admin apenas
router.post('/', protect, authorize('ADMIN'), lojaController.createLoja);
router.put('/:id', protect, authorize('ADMIN'), lojaController.updateLoja);
router.delete('/:id', protect, authorize('ADMIN'), lojaController.deleteLoja);

module.exports = router;
