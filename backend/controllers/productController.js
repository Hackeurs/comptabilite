const Product = require('../models/Product');
const User = require('../models/User');

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getProducts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, purchasePrice, stock, category, barcode, expirationDate, lowStockAlert } = req.body;

    if (!name || !price || purchasePrice === undefined) {
      return res.status(400).json({ message: 'Veuillez fournir les champs obligatoires' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      purchasePrice: purchasePrice || 0,
      stock: stock || 0,
      category: category || 'Général',
      barcode,
      expirationDate,
      lowStockAlert: lowStockAlert || 5,
      createdBy: req.user.id
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ce code barre existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    await product.update({ isActive: false });
    res.json({ message: 'Produit désactivé avec succès' });
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    await product.update({ stock: newStock });
    res.json(product);
  } catch (error) {
    console.error('Erreur adjustStock:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
};
