# Guide de Déploiement sur Railway (Cloud)

## Étape 1 : Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Créez un compte gratuit (vous pouvez utiliser GitHub)

## Étape 2 : Déployer avec GitHub
1. Sur Railway, cliquez sur **"New Project"**
2. Choisissez **"Deploy from GitHub repo"**
3. Connectez votre compte GitHub et sélectionnez votre dépôt
4. Cliquez sur **"Deploy Now"**

## Étape 3 : Ajouter une base de données PostgreSQL
1. Dans votre projet Railway, cliquez sur **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Attendez que la base de données soit prête

## Étape 4 : Configurer les variables d'environnement
1. Allez dans l'onglet **"Variables"** de votre service backend
2. Ajoutez ces variables (Railway remplira automatiquement les valeurs de la DB):
   ```
   NODE_ENV=production
   PORT=3000
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   JWT_SECRET= (générez un secret long et aléatoire)
   JWT_EXPIRE=30d
   CLIENT_URL=*
   ```

## Étape 5 : Redéployer
Cliquez sur **"Redeploy"** pour appliquer les changements

## Étape 6 : Configurer le frontend
1. Une fois déployé, copiez l'URL de votre backend (ex: `https://votre-projet.up.railway.app`)
2. Créez un fichier `.env` à la racine du projet :
   ```env
   EXPO_PUBLIC_API_URL=https://votre-projet.up.railway.app/api
   ```
