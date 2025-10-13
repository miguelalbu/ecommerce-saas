const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN'), userManagementController.getAllUsers);
router.delete('/users/:id', protect, authorize('ADMIN'), userManagementController.deleteUser);
router.delete('/customers/:id', protect, authorize('ADMIN'), userManagementController.deleteCustomer);

module.exports = router;