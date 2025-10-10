const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const validate = require('../middleware/validate');
const { createUserSchema, loginUserSchema } = require('../validators/userValidators');

router.post('/', validate(createUserSchema),userController.createUser);
router.post('/login', validate(loginUserSchema),userController.loginUser);

module.exports = router;