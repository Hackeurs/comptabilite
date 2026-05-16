# Guide de Déploiement sur Render (Cloud)

## Étape 1 : Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Créez un compte gratuit (vous pouvez utiliser GitHub ou votre email)

## Étape 2 : Pousser votre code sur GitHub
1. Initialisez un dépôt git dans votre projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Créez un dépôt sur GitHub
3. Poussez votre code sur GitHub :
   ```bash
   git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/VOTRE_DEPOT.git
   git branch -M main
   git push -u origin main
   ```

## Étape 3 : Déployer sur Render avec Blueprint
1. Sur Render, cliquez sur **"New +"** → **"Blueprint"**
2. Connectez votre compte GitHub et sélectionnez votre dépôt
3. Render détectera automatiquement le fichier `backend/render.yaml`
4. Cliquez sur **"Apply"**
5. Attendez que le déploiement se termine (ça peut prendre 5-10 minutes)

## Étape 4 : Configurer le frontend
1. Une fois le backend déployé, vous obtiendrez une URL comme : `https://comptabilite-backend-xyz123.onrender.com`
2. Créez un fichier `.env` à la racine du projet (copiez `.env.example`)
3. Remplacez la valeur de `EXPO_PUBLIC_API_URL` par votre URL Render :
   ```env
   EXPO_PUBLIC_API_URL=https://comptabilite-backend-xyz123.onrender.com/api
   ```

## Étape 5 : Tester !
1. Démarrez votre frontend avec `npm start`
2. Créez un compte et enregistrez des produits
3. Vous pouvez maintenant utiliser l'application depuis n'importe quel téléphone ! 🎉

## Important :
- Le plan gratuit de Render met en veille les apps après 15 minutes d'inactivité (ça reprend automatiquement)
- Pour une utilisation professionnelle, vous pouvez passer à un plan payant
