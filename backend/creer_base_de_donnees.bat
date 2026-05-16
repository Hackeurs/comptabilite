@echo off
chcp 65001 > nul
echo ========================================
echo   CRÉATION DE LA BASE DE DONNÉES
echo ========================================
echo.
echo Ce script va créer :
echo   - Base de données : comptabilite_db
echo   - Utilisateur : comptabilite_user
echo   - Mot de passe : comptabilite_secure_2026
echo.
echo Assurez-vous que PostgreSQL est installé et que le mot de passe de postgres est correct !
echo.
pause

echo.
echo Exécution du script SQL...
psql -U postgres -f init_database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ SUCCÈS !
    echo ========================================
    echo.
    echo Base de données prête !
    echo.
    echo Maintenant vous pouvez :
    echo   1. Installer les dépendances : npm install
    echo   2. Démarrer le backend : npm start
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ ERREUR !
    echo ========================================
    echo.
    echo Vérifiez :
    echo   1. PostgreSQL est bien installé
    echo   2. Le mot de passe de l'utilisateur postgres est correct
    echo   3. Le chemin d'accès à psql est dans le PATH
    echo.
    echo Vous pouvez aussi exécuter le fichier init_database.sql manuellement dans pgAdmin !
    echo.
)

pause
