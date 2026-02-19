const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuração de upload (pode ser movida para um middleware separado para organização)
const upload = multer({ dest: 'uploads/' });

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- CATEGORIAS ---
router.get('/categories', categoryController.getAllCategories); // Público
router.post('/categories', protect, authorize('ADMIN'), categoryController.createCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

// --- PRODUTOS ---
router.get('/products', productController.getAllProducts); // Público
router.get('/products/:id', productController.getProductById); // Público

// Criação e Edição (Restrito a Admin)
router.post('/products', protect, authorize('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/products/:id', protect, authorize('ADMIN'), upload.single('image'), productController.updateProduct);

// Exclusão (CORREÇÃO DE SEGURANÇA: Adicionado authorize('ADMIN'))
// Antes qualquer usuário logado podia deletar. Agora só Admin.
router.delete('/products/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;