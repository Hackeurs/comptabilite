# 🚀 GUIDE RAPIDE : Créer votre APK (sans Android Studio !)

---

## 📋 Étape 1 : Installer EAS CLI (1 seule fois)
Ouvrez **Command Prompt** (CMD) :
1. Appuyez sur **Windows + R**
2. Tapez `cmd` → Entrée
3. Exécutez :

```cmd
npm install -g eas-cli
```

---

## 📋 Étape 2 : Se connecter à Expo
Toujours dans CMD, dans votre projet :
```cmd
cd /d d:\PC\comptabilite
eas login
```
Suivez les instructions pour vous connecter (ou créer un compte Expo).

---

## 📋 Étape 3 : Générer l'APK
```cmd
eas build --platform android --profile preview
```

Attendez quelques minutes (EAS build dans le cloud !).

---

## 📋 Étape 4 : Télécharger l'APK
Quand c'est terminé, EAS vous donne un lien pour télécharger l'APK.

C'est tout ! 😊

---

## 💡 Pour info : Ce qui est déjà prêt pour le Cameroun
- Devise : FCFA ✓
- Paiements : Orange Money, MTN Mobile Money, Moov Money ✓
