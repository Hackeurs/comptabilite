const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');
const sequelize = require('../config/database');

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Erreur getSuppliers:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Erreur getSupplierById:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, phone, whatsapp, address, email } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Veuillez fournir le nom du fournisseur' });
    }

    const supplier = await Supplier.create({
      name,
      phone,
      whatsapp,
      address,
      email,
      createdBy: req.user.id
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Erreur createSupplier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    console.error('Erreur updateSupplier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    await supplier.update({ isActive: false });
    res.json({ message: 'Fournisseur désactivé avec succès' });
  } catch (error) {
    console.error('Erreur deleteSupplier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const recordSupplierPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { supplierId, amount, paymentMethod, transactionReference, notes } = req.body;

    if (!supplierId || !amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Veuillez fournir fournisseur et montant' });
    }

    const supplier = await Supplier.findByPk(supplierId, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const payment = await SupplierPayment.create({
      supplierId,
      amount,
      paymentMethod: paymentMethod || 'Espèces',
      transactionReference,
      notes,
      createdBy: req.user.id
    }, { transaction });

    const newBalance = parseFloat(supplier.balance) - parseFloat(amount);
    await supplier.update({ balance: newBalance }, { transaction });

    await transaction.commit();
    res.status(201).json(payment);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur recordSupplierPayment:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getSupplierPayments = async (req, res) => {
  try {
    const payments = await SupplierPayment.findAll({
      where: { supplierId: req.params.supplierId },
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Erreur getSupplierPayments:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  recordSupplierPayment,
  getSupplierPayments
};
