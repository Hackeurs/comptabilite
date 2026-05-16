# GUIDE DE COMMERCIALISATION - Comptabilité Chrétiens

---

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Assets à créer](#assets-à-créer)
3. [Configuration Google Play Store](#google-play-store)
4. [Configuration Apple App Store](#apple-app-store)
5. [Politiques juridiques](#politiques-juridiques)
6. [Build et publication](#build-et-publication)

---

## ✅ Prérequis

### A. Créer les dossiers et assets
Créez un dossier `assets/` à la racine du projet et ajoutez ces fichiers :

```
assets/
├── icon.png              # 1024x1024px (icône principale)
├── adaptive-icon.png     # 1024x1024px (icône Android adaptive)
└── splash.png            # 1284x2778px (écran de démarrage)
```

### B. Outils nécessaires
- Compte **Google Play Developer** (25 $ frais unique)
- Compte **Apple Developer** (99 $/an)
- EAS CLI installé : `npm install -g eas-cli`

---

## 🎨 Assets à créer

### 1. Icône de l'application
- **Taille** : 1024x1024px
- **Format** : PNG
- **Fond** : Transparent ou couleur unie (#059669)
- **Contenu** : Logo avec icône de comptabilité (ex: livre + euros)

### 2. Écran de démarrage (Splash Screen)
- **Taille** : 1284x2778px
- **Format** : PNG
- **Fond** : #059669
- **Contenu** : Logo + "Comptabilité Chrétiens"

### 3. Screenshots (8-10 captures)
Prenez des captures d'écran de ces écrans :
1. Écran de connexion
2. Tableau de bord
3. Gestion des ventes
4. Gestion du stock
5. Bilans/rapports
6. Gestion des clients

**Tailles pour Android** :
- Phone : 1080x1920px
- 7" Tablet : 1200x1920px
- 10" Tablet : 1600x2560px

**Tailles pour iOS** :
- iPhone 6.7" : 1290x2796px
- iPhone 6.5" : 1242x2688px
- iPad 12.9" : 2048x2732px

### 4. Feature Graphic (Android seulement)
- **Taille** : 1024x500px
- **Format** : PNG/JPG
- **Contenu** : Bannière promotionnelle

---

## 📱 Google Play Store

### 1. Créer un compte développeur
- Allez sur : https://play.google.com/console
- Payez les frais d'inscription (25 $)
- Remplissez les informations de votre compte

### 2. Créer une nouvelle application
1. Cliquez sur **Créer une app**
2. Remplissez :
   - Nom de l'app : `Comptabilité Chrétiens`
   - Langue par défaut : Français (France)
   - Type d'app : Application
   - Gratuite ou payante : Gratuite (pour commencer)
3. Acceptez les conditions

### 3. Configurer la fiche produit
- **Description courte** : 80 caractères max
- **Description complète** : Expliquez toutes les fonctionnalités
- **Catégorie** : Finance > Gestion d'entreprise
- **Tags** : comptabilité, gestion, caisse, stock, facturation
- **Contact** : Votre email
- **Site web** : Si vous en avez un
- **Confidentialité** : URL de votre politique de confidentialité

### 4. Télécharger les assets
- Icône (512x512px)
- Feature graphic (1024x500px)
- Screenshots
- Promotional video (optionnel)

---

## 🍎 Apple App Store

### 1. Créer un compte développeur
- Allez sur : https://developer.apple.com/programs/
- Payez l'abonnement annuel (99 $)
- Remplissez les informations

### 2. Créer un identifiant d'application (Bundle ID)
1. Allez dans **Certificates, Identifiers & Profiles**
2. Cliquez sur **Identifiers** → **+**
3. Sélectionnez **App IDs** → **Continue**
4. Remplissez :
   - Description : `Comptabilité Chrétiens`
   - Bundle ID : `com.chretiens.comptabilite`
5. Cochez les capacités nécessaires
6. Enregistrez

### 3. Créer l'application dans App Store Connect
1. Allez sur : https://appstoreconnect.apple.com
2. Cliquez sur **My Apps** → **+** → **New App**
3. Remplissez :
   - Plateformes : iOS
   - Nom : `Comptabilité Chrétiens`
   - Langue principale : Français
   - Bundle ID : Sélectionnez celui que vous avez créé
   - SKU : Identifiant unique (ex: `COMPTABILITE-001`)
4. Créer

### 4. Configurer la fiche
- **Informations** : Nom, sous-titre, description, mots-clés
- **Prix et disponibilité** : Gratuit
- **Informations sur la vie privée** : URL de politique de confidentialité
- **Support** : Votre contact
- **Captures d'écran** : Téléchargez vos screenshots

---

## ⚖️ Politiques juridiques (ESSENTIELLES)

Vous **devez** créer ces deux documents et les héberger sur un site web (GitHub Pages, Netlify, etc.) :

### 1. Politique de confidentialité
**Contenu minimum** :
- Quelles données collectez-vous (nom, données de comptabilité, etc.)
- Comment utilisez-vous ces données
- Comment protégez-vous les données
- Vos droits (accès, modification, suppression)
- Contact

### 2. Conditions Générales d'Utilisation (CGU)
**Contenu minimum** :
- Acceptation des conditions
- Description du service
- Responsabilités de l'utilisateur
- Responsabilités de l'éditeur
- Propriété intellectuelle
- Résiliation
- Droit applicable

**Outils gratuits pour générer ces politiques** :
- Termly : https://termly.io/
- GetTerms : https://getterms.io/
- Shopify Privacy Policy Generator

---

## 🚀 Build et publication

### Étape 1 : Se connecter à EAS
```bash
eas login
```

### Étape 2 : Configurer EAS (si ce n'est pas déjà fait)
```bash
eas build:configure
```

### Étape 3 : Build Android (APK/AAB)
Pour un build de production :
```bash
eas build --platform android --profile production
```

Pour un build de test :
```bash
eas build --platform android --profile preview
```

### Étape 4 : Build iOS
```bash
eas build --platform ios --profile production
```

### Étape 5 : Soumettre aux stores

**Android** :
1. Téléchargez le fichier `.aab` depuis EAS
2. Allez dans Google Play Console
3. Sélectionnez votre app → **Production** → **Créer une nouvelle version**
4. Téléchargez le fichier `.aab`
5. Remplissez les notes de version
6. Soumettez pour examen

**iOS** :
```bash
eas submit --platform ios
```
Ou via App Store Connect :
1. Téléchargez le fichier `.ipa` depuis EAS
2. Utilisez Transporter.app pour l'uploader
3. Allez dans App Store Connect → TestFlight ou Production
4. Soumettez pour examen

---

## 📊 Après la publication

### 1. Surveillez les reviews
Répondez aux commentaires des utilisateurs

### 2. Mettez à jour régulièrement
- Corrections de bugs
- Nouvelles fonctionnalités
- Améliorations UX

### 3. Marketing
- Partagez sur les réseaux sociaux
- Créez un site web de présentation
- Faites des vidéos tutoriels
- Contactez des influenceurs/commerçants

---

## 🆘 Aide et support

- **Documentation Expo** : https://docs.expo.dev/
- **Google Play Console Help** : https://support.google.com/googleplay/android-developer/
- **App Store Connect Help** : https://developer.apple.com/help/app-store-connect/

---

**Bon courage pour la publication ! 🎉**
