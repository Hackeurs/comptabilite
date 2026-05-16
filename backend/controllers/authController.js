const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password, businessName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Veuillez fournir username et mot de passe' });
    }

    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const user = await User.create({
      username,
      email,
      password,
      businessName,
      role: 'ADMIN'
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      token: generateToken(user.id)
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (user && (await user.comparePassword(password)) && user.isActive) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Identifiants invalides ou compte désactivé' });
    }

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe };
