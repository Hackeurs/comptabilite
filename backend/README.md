# Backend Comptabilité Professionnelle

## 🚀 Installation

1. Installer PostgreSQL sur votre machine
2. Créer une base de données : `comptabilite_db`
3. Configurer le fichier `.env` avec vos identifiants PostgreSQL
4. Installer les dépendances : `npm install`
5. Démarrer le serveur : `npm run dev`

## 📝 Configuration .env

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=votre-cle-secrete-tres-securisee-pour-le-jwt-changez-la-!
JWT_EXPIRE=30d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=comptabilite_db
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe

CLIENT_URL=http://localhost:8081
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription administrateur
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Récupérer l'utilisateur connecté (requiert token)

### Produits (requiert authentification)
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (Admin seulement)
- `PUT /api/products/:id` - Modifier un produit (Admin seulement)
- `DELETE /api/products/:id` - Désactiver un produit (Admin seulement)
- `POST /api/products/:id/adjust-stock` - Ajuster le stock d'un produit

### Ventes (requiert authentification)
- `GET /api/sales` - Historique des ventes
- `GET /api/sales/stats` - Statistiques des ventes
- `GET /api/sales/:id` - Détails d'une vente
- `POST /api/sales` - Enregistrer une vente
- `DELETE /api/sales/:id` - Annuler une vente (Admin seulement)

### Fournisseurs (requiert authentification)
- `GET /api/suppliers` - Liste des fournisseurs
- `GET /api/suppliers/:id` - Détails d'un fournisseur
- `POST /api/suppliers` - Créer un fournisseur (Admin seulement)
- `PUT /api/suppliers/:id` - Modifier un fournisseur (Admin seulement)
- `DELETE /api/suppliers/:id` - Désactiver un fournisseur (Admin seulement)
- `POST /api/suppliers/payment` - Enregistrer paiement (Admin seulement)
- `GET /api/suppliers/:supplierId/payments` - Historique paiements fournisseur

### Dépenses (requiert authentification)
- `GET /api/expenses` - Liste des dépenses
- `GET /api/expenses/stats` - Statistiques des dépenses
- `GET /api/expenses/:id` - Détails d'une dépense
- `POST /api/expenses` - Créer une dépense (Admin seulement)
- `PUT /api/expenses/:id` - Modifier une dépense (Admin seulement)
- `DELETE /api/expenses/:id` - Supprimer une dépense (Admin seulement)

## 🛠️ Technologies

- Node.js + Express.js
- PostgreSQL avec Sequelize ORM
- JWT pour l'authentification sécurisée
- bcryptjs pour le hachage des mots de passe
- Socket.io pour les mises à jour en temps réel

## 📊 Modèles de données

- **User** - Utilisateurs (Admin/Employé)
- **Product** - Produits avec gestion de stock
- **Sale** - Ventes enregistrées
- **Supplier** - Fournisseurs
- **Expense** - Dépenses
- **SupplierPayment** - Paiements aux fournisseurs

## 🔐 Sécurité

- Mots de passe hachés avec bcryptjs
- Authentification JWT avec tokens expirables
- Middleware de protection des routes
- Gestion des rôles (Admin/Employé)

