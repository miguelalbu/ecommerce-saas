// /backend/src/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { checkoutSchema } = require('../validators/userValidators');

// Middleware opcional: autentica se houver token, mas não bloqueia se não houver
const getOptionalUser = (req, res, next) => {
  protect(req, res, (err) => next());
};

router.post('/', getOptionalUser, validate(checkoutSchema), checkoutController.placeOrder);

module.exports = router;
