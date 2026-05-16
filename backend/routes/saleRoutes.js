const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  deleteSale,
  getSalesStats
} = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSales);
router.get('/stats', protect, getSalesStats);
router.get('/:id', protect, getSaleById);
router.post('/', protect, createSale);
router.delete('/:id', protect, authorize('ADMIN'), deleteSale);

module.exports = router;
