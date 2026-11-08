-- ═══════════════════════════════════════════════════════════
--  SmartTransport 2035 — Schéma MySQL (WampServer)
--  Étudiant : RAMANDIMBISON Joel Alpha · SE20240070
--
--  COMMENT IMPORTER CE FICHIER DANS PHPMYADMIN :
--  1. Ouvrir http://localhost/phpmyadmin
--  2. Cliquer sur "Nouvelle base de données" → smarttransport → Créer
--  3. Sélectionner la BDD "smarttransport"
--  4. Onglet "Importer" → Choisir ce fichier → Exécuter
-- ═══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS smarttransport
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smarttransport;

-- ─── Table : cities ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id          VARCHAR(5)     NOT NULL PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL,
  lat         DECIMAL(9,6)   NOT NULL,
  lng         DECIMAL(9,6)   NOT NULL,
  region      VARCHAR(100)   DEFAULT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Table : routes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id              INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  from_city       VARCHAR(5)     NOT NULL,
  to_city         VARCHAR(5)     NOT NULL,
  distance_km     INT            NOT NULL,
  duration_h      DECIMAL(5,1)   NOT NULL,
  fuel_liters     INT            NOT NULL,
  traffic_factor  DECIMAL(3,1)   NOT NULL DEFAULT 1.0,
  status          ENUM('open','closed','maintenance') NOT NULL DEFAULT 'open',
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (from_city) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_city)   REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY uq_route (from_city, to_city)
);

-- ─── Table : users ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)    NOT NULL UNIQUE,
  email       VARCHAR(150)   NOT NULL UNIQUE,
  password    VARCHAR(255)   NOT NULL,
  role        ENUM('passenger','driver','admin') NOT NULL DEFAULT 'passenger',
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ─── Table : search_history ─────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          DEFAULT NULL,
  from_city       VARCHAR(5)   NOT NULL,
  to_city         VARCHAR(5)   NOT NULL,
  traffic_level   TINYINT      NOT NULL DEFAULT 0,
  total_distance  INT          DEFAULT NULL,
  total_time      DECIMAL(5,1) DEFAULT NULL,
  total_fuel      INT          DEFAULT NULL,
  path_json       JSON         DEFAULT NULL,
  exec_time_ms    INT          DEFAULT NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Table : vehicles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plate        VARCHAR(20)  NOT NULL UNIQUE,
  capacity     INT          NOT NULL DEFAULT 15,
  driver_id    INT          DEFAULT NULL,
  status       ENUM('available','on_route','maintenance') NOT NULL DEFAULT 'available',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Table : knapsack_sessions ──────────────────────────────
CREATE TABLE IF NOT EXISTS knapsack_sessions (
  id              INT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vehicle_id      INT    DEFAULT NULL,
  capacity        INT    NOT NULL,
  passengers_json JSON   NOT NULL,
  selected_json   JSON   NOT NULL,
  total_value     INT    NOT NULL,
  naive_value     INT    NOT NULL,
  gain_percent    INT    NOT NULL,
  exec_time_ms    INT    DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- ─── Index ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes (status);
CREATE INDEX IF NOT EXISTS idx_history_date  ON search_history (created_at);
