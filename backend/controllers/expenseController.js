const Expense = require('../models/Expense');
const sequelize = require('../config/database');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [['date', 'DESC']]
    });
    res.json(expenses);
  } catch (error) {
    console.error('Erreur getExpenses:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Erreur getExpenseById:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { description, amount, category, date, paymentMethod, notes } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ message: 'Veuillez fournir description et montant' });
    }

    const expense = await Expense.create({
      description,
      amount,
      category: category || 'Général',
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Espèces',
      notes,
      createdBy: req.user.id
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Erreur createExpense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    await expense.update(req.body);
    res.json(expense);
  } catch (error) {
    console.error('Erreur updateExpense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    await expense.destroy();
    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Erreur deleteExpense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getExpensesStats = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.date = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (category) {
      where.category = category;
    }

    const expenses = await Expense.findAll({ where });
    const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({
      totalExpense,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Erreur getExpensesStats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesStats
};
