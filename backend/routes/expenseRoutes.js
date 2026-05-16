const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesStats
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getExpenses);
router.get('/stats', protect, getExpensesStats);
router.get('/:id', protect, getExpenseById);
router.post('/', protect, authorize('ADMIN'), createExpense);
router.put('/:id', protect, authorize('ADMIN'), updateExpense);
router.delete('/:id', protect, authorize('ADMIN'), deleteExpense);

module.exports = router;
