// /backend/src/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

// Middleware opcional para pegar o usuário se ele estiver logado
const getOptionalUser = (req, res, next) => {
  // Isso apenas chama o 'protect' sem falhar se não houver token.
  // O 'protect' adiciona req.user se o token for válido.
  protect(req, res, (err) => next());
};

router.post('/', getOptionalUser, checkoutController.placeOrder);

module.exports = router;