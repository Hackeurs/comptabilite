# GUIDE COMPLET D'UTILISATION

## 📱 Partie 1 : Utilisation LOCALE (pour l'instant)

### Comment ça fonctionne ?
L'application stocke toutes les données **directement sur le téléphone** (base de données SQLite).

### 🚀 Démarrage rapide

#### 1. Créer le compte Administrateur
1. Ouvre l'application
2. Clique sur **"Créer un compte administrateur"**
3. Remplis les champs :
   - Ton nom complet
   - Nom de ton commerce
   - Code PIN (4 chiffres minimum)
4. Clique sur **"Commencer mon travail"**

#### 2. Ajouter des Employés
1. Connecte-toi en Administrateur
2. Va dans **Paramètres** → **Employés et Administrateurs**
3. Clique sur le bouton **"+"**
4. Remplis les informations de l'employé :
   - Nom d'utilisateur
   - Téléphone (optionnel)
   - Email (optionnel)
   - Rôle (Employé ou Administrateur)
   - Code PIN (4 chiffres)
   - Salaire (optionnel)
5. Définis les **permissions** de l'employé (ce qu'il peut ou ne peut pas faire)
6. Sauvegarde !

#### 3. Connexion des Employés
Sur le **même téléphone** :
1. Ouvre l'application
2. Sélectionne le compte de l'employé dans la liste
3. Saisis son code PIN
4. Il peut travailler avec les permissions que tu as définies !

---

## 💾 Partie 2 : Sauvegarder et Partager les Données

### Sauvegarder les données
1. Va dans **Paramètres**
2. Descends jusqu'à **"Sauvegarde & Restauration"**
3. Clique sur **"Sauvegarder & Partager"**
4. Choisis comment partager le fichier (WhatsApp, Bluetooth, Email, etc.)

### Restaurer les données sur un autre téléphone
1. Installe l'application sur le nouveau téléphone
2. Envoie-toi le fichier de sauvegarde (`.json`)
3. Ouvre le fichier avec l'application "Comptabilité Chrétiens"
4. Les données sont restaurées !

---

## ☁️ Partie 3 : Synchronisation CLOUD (à venir)

Pour avoir une vraie synchronisation entre plusieurs téléphones, on a besoin d'un serveur. Voici ce qu'on a préparé :

### Ce qui est déjà prêt :
✅ Backend Node.js + Express
✅ Modèles de base de données (PostgreSQL)
✅ API d'authentification
✅ Tous les modèles (User, Product, Sale, Expense, etc.)

### Ce qu'il reste à faire (quand le réseau revient) :
1. Installer les dépendances du backend
2. Configurer PostgreSQL
3. Démarrer le serveur
4. Connecter l'application au backend
5. Déployer le serveur en ligne (pour que tout le monde puisse y accéder)

---

## 🔐 Gestion des Permissions

### Rôles disponibles :
- **Administrateur** : Accès à TOUT (gestion des employés, suppression de données, etc.)
- **Employé** : Accès limité selon les permissions que tu définis

### Permissions configurables pour les Employés :
- Voir/Modifier/Supprimer les ventes
- Voir/Modifier/Supprimer les produits
- Voir/Modifier/Supprimer les dépenses
- Voir les rapports
- Gérer les clients
- Gérer les fournisseurs
- Gérer la caisse
- Gérer les crédits

---

## 📞 Besoin d'aide ?
Si tu as des questions, vérifie d'abord ce guide. Sinon, tu peux toujours contacter le support !

---

**Version : 1.3.0**
**Dernière mise à jour : 15 Mai 2026**
