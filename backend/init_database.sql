-- Script pour créer la base de données et l'utilisateur PostgreSQL
-- Exécute ce script dans psql ou pgAdmin

-- 1. Créer l'utilisateur
CREATE USER comptabilite_user WITH PASSWORD 'comptabilite_secure_2026';

-- 2. Créer la base de données
CREATE DATABASE comptabilite_db;

-- 3. Donner tous les privilèges à l'utilisateur sur la base de données
GRANT ALL PRIVILEGES ON DATABASE comptabilite_db TO comptabilite_user;

-- 4. Se connecter à la nouvelle base de données
\c comptabilite_db;

-- 5. Donner tous les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO comptabilite_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO comptabilite_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO comptabilite_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO comptabilite_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO comptabilite_user;

-- Message de succès
\echo '✅ Base de données "comptabilite_db" et utilisateur "comptabilite_user" créés avec succès !';
\echo 'Mot de passe : comptabilite_secure_2026';
