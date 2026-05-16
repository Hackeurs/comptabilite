# GUIDE COMPLET - MISE EN PLACE DU BACKEND ET SYNCHRONISATION CLOUD

Ce guide va te permettre de mettre en place une vraie synchronisation entre TOUS les téléphones !

---

## 📋 Prérequis
- PostgreSQL installé sur ton ordinateur
- Node.js installé (version 16 ou supérieure)
- npm ou yarn installé

---

## ÉTAPE 1 : Configurer PostgreSQL

### 1.1 Créer la base de données
Ouvre un terminal et exécute ces commandes :
```bash
psql -U postgres
```
(Entre ton mot de passe PostgreSQL si demandé)

Puis dans psql :
```sql
CREATE DATABASE comptabilite_db;
CREATE USER comptabilite_user WITH PASSWORD 'ton_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE comptabilite_db TO comptabilite_user;
\q
```

### 1.2 Mettre à jour le fichier .env
Ouvre le fichier `backend/.env` et modifie-le avec tes identifiants :
```env
PORT=5000
NODE_ENV=development

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=comptabilite_db
DB_USER=comptabilite_user
DB_PASSWORD=ton_mot_de_passe_securise

# JWT Secret (génère un secret sécurisé pour la production)
JWT_SECRET=change_ce_secret_avec_un_texte_tres_long_aleatoire_et_securise
JWT_EXPIRE=30d

# URL du client (pour CORS)
CLIENT_URL=*
```

---

## ÉTAPE 2 : Installer les dépendances du Backend

Ouvre un terminal, va dans le dossier `backend` :
```bash
cd backend
npm install
```

Attends que toutes les dépendances soient installées !

---

## ÉTAPE 3 : Démarrer le Backend

Toujours dans le dossier `backend` :
```bash
npm start
```

Tu devrais voir ceci :
```
✅ Connexion à la base de données établie
✅ Modèles synchronisés avec la base de données
🚀 Serveur backend démarré sur le port 5000
```

Super ! Le backend fonctionne ! 🎉

---

## ÉTAPE 4 : Tester le Backend

Ouvre ton navigateur et va sur :
```
http://localhost:5000
```

Tu devrais voir :
```json
{
  "message": "API Comptabilité Backend is running!"
}
```

Parfait ! Le backend répond !

---

## ÉTAPE 5 : Configurer l'Application pour le Backend

Ouvre le fichier `src/api/api.ts` et vérifie l'URL :
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

Si tu testes sur un téléphone physique, remplace `localhost` par l'IP de ton ordinateur sur le réseau !

---

## ÉTAPE 6 : Déployer le Backend en Ligne (pour que tout le monde y accède)

Pour que la synchronisation fonctionne sur des téléphones différents (pas seulement sur le même réseau), tu dois déployer le backend en ligne !

### Option A : Utiliser Railway (Le plus simple et gratuit !)
1. Crée un compte sur https://railway.app
2. Clique sur "New Project" → "Deploy from GitHub repo"
3. Sélectionne ton dépôt GitHub
4. Ajoute les variables d'environnement (mêmes que dans le .env)
5. Railway créera automatiquement une base de données PostgreSQL pour toi !
6. Clique sur "Deploy"

C'est prêt ! Railway te donnera une URL comme :
`https://ton-projet-comptabilite.up.railway.app`

### Option B : Utiliser Render
Similaire à Railway, gratuit pour petit usage !
- https://render.com

### Option C : Utiliser Vercel + Supabase
- Supabase pour la base de données (gratuit)
- Vercel pour le backend (gratuit)

---

## ÉTAPE 7 : Mettre à jour l'Application avec l'URL de Production

Quand tu as ton URL en ligne (ex: `https://ton-projet.up.railway.app`), modifie `src/api/api.ts` :
```typescript
const API_BASE_URL = 'https://ton-projet.up.railway.app/api';
```

---

## ÉTAPE 8 : Tester la Synchronisation !

1. Installe l'application sur 2 téléphones différents
2. Crée un compte sur le premier téléphone
3. Ajoute un produit
4. Ouvre l'application sur le deuxième téléphone
5. Connecte-toi avec le même compte
6. Le produit doit apparaître automatiquement ! 🎉

---

## 🔧 API Endpoints Disponibles

### Authentification
- `POST /api/auth/register` - Inscrire un utilisateur
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Récupérer l'utilisateur connecté (nécessite un token)

### Produits
- `GET /api/products` - Récupérer tous les produits
- `GET /api/products/:id` - Récupérer un produit par ID
- `POST /api/products` - Créer un produit (Admin seulement)
- `PUT /api/products/:id` - Modifier un produit (Admin seulement)
- `DELETE /api/products/:id` - Désactiver un produit (Admin seulement)
- `POST /api/products/:id/adjust-stock` - Ajuster le stock

### Ventes
- `GET /api/sales` - Récupérer toutes les ventes
- `POST /api/sales` - Créer une vente
- `DELETE /api/sales/:id` - Supprimer une vente

### Dépenses
- `GET /api/expenses` - Récupérer toutes les dépenses
- `POST /api/expenses` - Créer une dépense
- `PUT /api/expenses/:id` - Modifier une dépense
- `DELETE /api/expenses/:id` - Supprimer une dépense

### Fournisseurs
- `GET /api/suppliers` - Récupérer tous les fournisseurs
- `POST /api/suppliers` - Créer un fournisseur
- `PUT /api/suppliers/:id` - Modifier un fournisseur
- `DELETE /api/suppliers/:id` - Supprimer un fournisseur

---

## 📞 Besoin d'aide ?
Si tu rencontres un problème, vérifie d'abord :
1. Le backend est bien démarré ?
2. PostgreSQL fonctionne ?
3. Les identifiants dans le .env sont corrects ?
4. L'URL dans l'application est correcte ?

---

**Félicitations ! Tu as maintenant une application de comptabilité avec synchronisation CLOUD !** 🎉🚀

---
Version du guide : 1.0
Dernière mise à jour : 15 Mai 2026
