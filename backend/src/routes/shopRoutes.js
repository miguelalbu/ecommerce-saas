const express = require('express');
const router = express.Router();
const multer = require('multer');


const upload = multer({ dest: 'uploads/' });
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');




router.get('/categories', categoryController.getAllCategories);
router.post('/categories', protect, authorize('ADMIN'), categoryController.createCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);
router.get('/products', productController.getAllProducts);
router.post('/products', protect, authorize('ADMIN'), upload.single('image'), productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', protect, authorize('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/products/:id', protect, productController.deleteProduct);
router.put('/products/:id', protect, authorize('ADMIN'), upload.single('image'), productController.updateProduct);

module.exports = router;