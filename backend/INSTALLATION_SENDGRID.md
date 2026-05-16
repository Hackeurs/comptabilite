# Configuration du Backend - SendGrid

## Étape 1: Créer un compte SendGrid

1. Allez sur https://sendgrid.com/
2. Créez un compte gratuit
3. Vérifiez votre email
4. Créez une **API Key** avec les permissions "Full Access" ou "Mail Send"

## Étape 2: Vérifier un expéditeur (Single Sender Verification)

1. Dans SendGrid, allez dans **Sender Authentication**
2. Cliquez sur **Verify a Single Sender**
3. Ajoutez votre email (ex: votre@email.com)
4. Cliquez sur le lien de vérification dans votre boîte mail

## Étape 3: Configurer le serveur

1. Renommez le fichier `.env.example` en `.env`
2. Éditez le fichier `.env` :
   ```
   SENDGRID_API_KEY=VOTRE_CLE_API_SENDGRID_ICI
   SENDGRID_FROM_EMAIL=votre@email.com
   PORT=3000
   ```
3. Remplacez :
   - `VOTRE_CLE_API_SENDGRID_ICI` par votre clé API SendGrid
   - `votre@email.com` par l'email vérifié sur SendGrid

## Étape 4: Installer et lancer le serveur

### Option 1: Utiliser server-package.json

1. Renommez `server-package.json` en `package.json` (dans un dossier backend séparé)
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur :
   ```bash
   npm start
   ```

### Option 2: Installer manuellement

1. Créez un dossier `backend`
2. Copiez `server.js` dedans
3. Copiez `.env` dedans
4. Créez un package.json :
   ```json
   {
     "name": "compta-backend",
     "version": "1.0.0",
     "main": "server.js",
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "@sendgrid/mail": "^8.1.0",
       "dotenv": "^16.3.1"
     }
   }
   ```
5. Installez et lancez :
   ```bash
   npm install
   npm start
   ```

## Étape 5: Tester

Le serveur devrait être en ligne sur `http://localhost:3000`

Testez la santé : `http://localhost:3000/api/health`

## Mode Démo (sans SendGrid)

Si vous n'avez pas de compte SendGrid, l'application fonctionne toujours en **mode démo** :
- Le code est affiché directement dans une alerte
- Vous pouvez toujours tester le flux complet

## Pour le déploiement

Pour déployer en production :
1. Utilisez un hébergeur comme Vercel, Render, Heroku ou AWS
2. Configurez les variables d'environnement
3. Utilisez HTTPS en production
4. Mettez à jour `API_BASE_URL` dans le frontend avec votre URL de production

---

## Troubleshooting

- **Erreur CORS**: Vérifiez que le serveur et le frontend sont sur le même réseau
- **Erreur SendGrid**: Vérifiez votre API Key et votre Sender Verification
- **Port occupé**: Changez le PORT dans le fichier .env

Bon courage ! 🚀
