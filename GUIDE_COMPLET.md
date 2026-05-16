# 📚 Guide Complet - Application Comptabilité Professionnelle

## 🎯 Présentation

Application professionnelle de gestion de magasin, supermarché et caisse intelligente pour les commerces africains (Cameroun et toute l'Afrique).

### Technologies
- **Frontend** : React Native + Expo + TypeScript
- **Backend** : Node.js + Express.js
- **Base de données** : PostgreSQL
- **Authentification** : JWT + bcrypt
- **Mise à jour temps réel** : Socket.io

---

## 📦 Structure du Projet

```
comptabilite/
├── src/                    # Frontend React Native
│   ├── screens/
│   ├── database/
│   └── ...
├── backend/                # Backend Node.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
├── app.json
├── package.json
└── GUIDE_COMPLET.md
```

---

## 🚀 Installation & Configuration

### Étape 1 : Installer PostgreSQL

1. Téléchargez PostgreSQL : https://www.postgresql.org/download/
2. Installez-le et notez votre mot de passe pour l'utilisateur `postgres`
3. Ouvrez pgAdmin ou psql et créez une base de données :
   ```sql
   CREATE DATABASE comptabilite_db;
   ```

### Étape 2 : Configurer le Backend

1. Allez dans le dossier backend :
   ```powershell
   cd backend
   ```

2. Installez les dépendances :
   ```powershell
   npm install
   ```

3. Modifiez le fichier `.env` avec vos informations :
   ```env
   PORT=5000
   NODE_ENV=development
   
   JWT_SECRET=une-cle-secrete-tres-longue-et-securisee-!changez-moi
   JWT_EXPIRE=30d
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=comptabilite_db
   DB_USER=postgres
   DB_PASSWORD=votre-mot-de-passe-postgres
   
   CLIENT_URL=http://localhost:8081
   ```

4. Démarrez le backend :
   ```powershell
   npm run dev
   ```

Vous devriez voir :
```
✅ Connexion à la base de données établie
✅ Modèles synchronisés avec la base de données
🚀 Serveur backend démarré sur le port 5000
```

### Étape 3 : Frontend React Native

1. Revenez à la racine du projet :
   ```powershell
   cd ..
   ```

2. Installez les dépendances (si pas déjà fait) :
   ```powershell
   npm install
   ```

3. Démarrez le frontend :
   ```powershell
   npm start
   ```

4. Pour générer l'APK Android :
   ```powershell
   eas build --platform android --profile preview
   ```

---

## 📡 API Complete Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentification

#### Inscription Administrateur
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@exemple.com",
  "password": "motdepasse123",
  "businessName": "Mon Magasin"
}
```

#### Connexion
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "motdepasse123"
}
```

Réponse :
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@exemple.com",
  "role": "ADMIN",
  "businessName": "Mon Magasin",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Récupérer mon profil (requiert token)
```http
GET /auth/me
Authorization: Bearer VOTRE_TOKEN
```

---

### Produits

Toutes les routes nécessitent un token.

```http
GET /products
GET /products/:id
POST /products           # Admin seulement
PUT /products/:id        # Admin seulement
DELETE /products/:id     # Admin seulement
POST /products/:id/adjust-stock
```

#### Créer un produit
```http
POST /products
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "name": "Riz Basmati",
  "description": "Riz de qualité supérieure",
  "price": 2500,
  "purchasePrice": 1800,
  "stock": 50,
  "category": "Alimentation",
  "barcode": "123456789",
  "expirationDate": "2025-12-31",
  "lowStockAlert": 5
}
```

#### Ajuster le stock
```http
POST /products/1/adjust-stock
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "quantity": 10  # +10 pour ajouter, -5 pour réduire
}
```

---

### Ventes

```http
GET /sales
GET /sales/stats
GET /sales/:id
POST /sales
DELETE /sales/:id     # Admin seulement
```

#### Enregistrer une vente
```http
POST /sales
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2,
  "paymentMethod": "Espèces",
  "transactionReference": "REF123",
  "discount": 5,
  "notes": "Client régulier"
}
```

Paiements acceptés : `Espèces`, `Orange Money`, `MTN Mobile Money`, `Moov Money`, `Carte Bancaire`, `Crédit`

---

### Fournisseurs

```http
GET /suppliers
GET /suppliers/:id
POST /suppliers              # Admin seulement
PUT /suppliers/:id           # Admin seulement
DELETE /suppliers/:id        # Admin seulement
POST /suppliers/payment      # Admin seulement
GET /suppliers/:supplierId/payments
```

#### Créer un fournisseur
```http
POST /suppliers
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "name": "Fournisseur ABC",
  "phone": "+237612345678",
  "whatsapp": "+237612345678",
  "address": "Douala, Cameroun",
  "email": "contact@fournisseur.com"
}
```

#### Enregistrer un paiement à un fournisseur
```http
POST /suppliers/payment
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "supplierId": 1,
  "amount": 50000,
  "paymentMethod": "Orange Money",
  "transactionReference": "OM123456",
  "notes": "Paiement facture Janvier"
}
```

---

### Dépenses

```http
GET /expenses
GET /expenses/stats
GET /expenses/:id
POST /expenses          # Admin seulement
PUT /expenses/:id       # Admin seulement
DELETE /expenses/:id    # Admin seulement
```

#### Créer une dépense
```http
POST /expenses
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

{
  "description": "Loyer du local",
  "amount": 100000,
  "category": "Loyer",
  "date": "2025-01-15",
  "paymentMethod": "Espèces",
  "notes": "Loyer Janvier"
}
```

---

## 🛡️ Sécurité

- **Mots de passe** : Hachés avec bcryptjs (coût 10)
- **Authentification** : JWT avec token expirable (30 jours par défaut)
- **Rôles** :
  - `ADMIN` : Accès complet
  - `EMPLOYEE` : Accès limité (ventes, consultation stock)
- **Transactions** : Toutes les opérations critiques utilisent des transactions SQL

---

## 📱 Fonctionnalités Frontend

L'application React Native inclut déjà :
- ✅ Gestion de stock avec ajustements rapides
- ✅ Ventes avec panier et calcul automatique
- ✅ Dépenses avec catégories
- ✅ Caisse avec historique
- ✅ Clients et Fournisseurs
- ✅ Crédits et Rapports
- ✅ Authentification
- ✅ Design moderne et responsive

---

## 🔧 Troubleshooting

### Problème : Impossible de se connecter à PostgreSQL
Vérifiez :
- PostgreSQL est en cours d'exécution
- Les informations dans `.env` sont correctes
- Le port 5432 n'est pas bloqué

### Problème : Echec de la build APK
Vérifiez :
- Votre connexion internet
- Le slug dans `app.json` correspond à votre projet Expo
- Vous êtes connecté avec `eas login`

---

## 🎉 Prochaines Étapes

Pour aller plus loin :
1. Déployer le backend sur un serveur (VPS, Heroku, AWS, etc.)
2. Héberger PostgreSQL sur un service cloud (AWS RDS, Supabase, etc.)
3. Ajouter la synchronisation hors ligne
4. Intégrer l'impression Bluetooth thermique
5. Ajouter le scanner code barre
6. Configurer les notifications push
7. Ajouter la génération PDF

---

## 📞 Support

Pour toute question ou problème, vérifiez d'abord les logs du backend et du frontend !

---

**Bon commerce !** 🚀
