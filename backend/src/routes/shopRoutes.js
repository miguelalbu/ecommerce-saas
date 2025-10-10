const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/categories', categoryController.getAllCategories);
router.post('/categories', protect, categoryController.createCategory);
router.get('/products', productController.getAllProducts);
router.post('/products', protect, productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', protect, productController.updateProduct);
router.delete('/products/:id', protect, productController.deleteProduct);

module.exports = router;