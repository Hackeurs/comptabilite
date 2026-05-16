# GUIDE DE COMMERCIALISATION - Cameroun 🇨🇲

---

## ✅ Adaptations déjà faites pour le Cameroun
1. **Devise par défaut : FCFA
2. **Méthodes de paiement ajoutées :
   - Espèces
   - Orange Money
   - MTN Mobile Money
   - Moov Money
   - Carte Bancaire
   - Crédit

---

## 🚀 Étape 1 : Générer le projet Android

### Problème de sécurité PowerShell
Si vous rencontrez une erreur "l’exécution de scripts est désactivée", suivez ces étapes :

1. Ouvrez PowerShell en **Administrateur**
2. Exécutez :
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Répondez `O` (Oui)

### Générer le projet Android
```bash
cd d:\PC\comptabilite
npx expo prebuild --platform android
```

Cela créera un dossier `android/` avec le projet Android Studio.

---

## 📱 Étape 2 : Ouvrir dans Android Studio

1. Ouvrez Android Studio
2. Cliquez sur **Open an Existing Project**
3. Sélectionnez le dossier `android/` dans votre projet
4. Attendez que Gradle synchronise les dépendances (cela peut prendre quelques minutes)

---

## 🇨🇲 Commercialisation spécifique au Cameroun

### 1. Cibles principales
- **Petits commerçants** (marchés, boutiques
- **Restaurants et bars**
- **Ateliers de couture, coiffure
- **Épiceries et supermarchés
- **Artisans et entrepreneurs indépendants

### 2. Stratégies de marketing

#### A. Réseaux sociaux
- Créez des comptes sur :
   - Facebook (très populaire au Cameroun)
   - WhatsApp Business
   - Instagram
   - TikTok

#### B. Partenariats
- Avec des écoles de commerce
- Avec des associations de commerçants
- Avec des influenceurs locaux

#### C. Démos gratuites
- Offrez 1 mois gratuit pour tester

### 3. Tarification adaptée
- **Version Gratuite** : Fonctionnalités de base
- **Version Premium** : 500 FCFA/mois ou 5 000 FCFA/an

---

## 📝 Améliorations futures pour le Cameroun
1. Intégration API Orange Money / MTN Mobile Money
2. Support français + anglais
3. Sauvegarde sur Google Drive
4. Rapports en PDF
5. Gestion multiple magasins

---

## 💼 Votre application est prête ! 🎉
