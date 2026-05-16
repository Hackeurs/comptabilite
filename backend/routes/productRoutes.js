const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, authorize('ADMIN'), createProduct);
router.put('/:id', protect, authorize('ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);
router.post('/:id/adjust-stock', protect, adjustStock);

module.exports = router;
