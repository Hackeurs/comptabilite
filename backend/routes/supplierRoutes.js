const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
  getSupplierPayments
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, authorize('ADMIN'), createSupplier);
router.put('/:id', protect, authorize('ADMIN'), updateSupplier);
router.delete('/:id', protect, authorize('ADMIN'), deleteSupplier);
router.post('/payment', protect, authorize('ADMIN'), recordSupplierPayment);
router.get('/:supplierId/payments', protect, getSupplierPayments);

module.exports = router;
