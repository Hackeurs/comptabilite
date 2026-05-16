# 🚀 CONFIGURATION RAPIDE DU BACKEND

## ÉTAPE 1 : Créer la base de données

### Option A : Avec le fichier batch (SIMPLE !)
1. Double-clique sur le fichier **`creer_base_de_donnees.bat`**
2. Suis les instructions à l'écran
3. Si ça fonctionne, tu verras "✅ SUCCÈS !"

### Option B : Avec pgAdmin ou psql
1. Ouvre pgAdmin ou psql
2. Exécute le fichier **`init_database.sql`**

---

## ÉTAPE 2 : Installer les dépendances

Ouvre un terminal dans ce dossier (backend) et exécute :
```bash
npm install
```

Attends que toutes les dépendances soient installées !

---

## ÉTAPE 3 : Démarrer le Backend

Toujours dans le terminal, exécute :
```bash
npm start
```

Tu devrais voir :
```
✅ Connexion à la base de données établie
✅ Modèles synchronisés avec la base de données
🚀 Serveur backend démarré sur le port 5000
```

---

## ÉTAPE 4 : Tester

Ouvre ton navigateur et va sur :
```
http://localhost:5000
```

Tu devrais voir un message de bienvenue !

---

## 📝 Informations de connexion :

- **Nom de la base de données** : `comptabilite_db`
- **Utilisateur** : `comptabilite_user`
- **Mot de passe** : `comptabilite_secure_2026`
- **Port** : `5432`
- **Host** : `localhost`

---

## ❌ Si ça ne fonctionne pas :

1. Vérifie que PostgreSQL est bien installé et démarré
2. Vérifie que le mot de passe de l'utilisateur `postgres` est correct
3. Tu peux modifier les identifiants dans le fichier `.env`
4. Pour des instructions détaillées, vois le fichier `../GUIDE_BACKEND_COMPLET.md`

---

Bon courage ! 🎉
