-- ═══════════════════════════════════════════════════════════
--  SmartTransport 2035 — Données initiales
--  À importer APRÈS schema.sql dans phpMyAdmin
-- ═══════════════════════════════════════════════════════════

USE smarttransport;

-- ─── Villes de Madagascar ────────────────────────────────────
INSERT IGNORE INTO cities (id, name, lat, lng, region) VALUES
  ('TNR', 'Antananarivo',    -18.913700,  47.536100, 'Analamanga'),
  ('TML', 'Toamasina',       -18.149200,  49.402300, 'Atsinanana'),
  ('MJN', 'Mahajanga',       -15.716700,  46.316700, 'Boeny'),
  ('DIE', 'Antsiranana',     -12.347200,  49.295800, 'Diana'),
  ('FTU', 'Toliara',         -23.356800,  43.691700, 'Atsimo-Andrefana'),
  ('FNI', 'Fianarantsoa',    -21.453200,  47.087200, 'Haute Matsiatra'),
  ('AMB', 'Ambatondrazaka',  -17.834700,  48.411900, 'Alaotra-Mangoro'),
  ('MOR', 'Morondava',       -20.295500,  44.279500, 'Menabe'),
  ('SMP', 'Sambava',         -14.266700,  50.166700, 'Sava'),
  ('IHO', 'Ihosy',           -22.403300,  46.123900, 'Ihorombe');

-- ─── Routes entre villes ────────────────────────────────────
INSERT IGNORE INTO routes (from_city, to_city, distance_km, duration_h, fuel_liters, traffic_factor, status) VALUES
  ('TNR', 'TML',  357, 7.0,  35, 1.2, 'open'),
  ('TNR', 'MJN',  572, 11.0, 55, 1.1, 'open'),
  ('TNR', 'FNI',  407, 8.0,  40, 1.3, 'open'),
  ('TNR', 'AMB',  298, 6.0,  30, 1.0, 'open'),
  ('TML', 'AMB',  180, 4.0,  18, 1.0, 'open'),
  ('TML', 'SMP',  520, 10.0, 50, 1.1, 'open'),
  ('MJN', 'DIE',  692, 14.0, 68, 1.0, 'open'),
  ('MJN', 'MOR',  480, 10.0, 47, 1.2, 'open'),
  ('FNI', 'FTU',  462, 9.0,  45, 1.1, 'open'),
  ('FNI', 'IHO',  200, 4.0,  20, 1.0, 'open'),
  ('IHO', 'FTU',  310, 6.0,  30, 1.1, 'open'),
  ('MOR', 'FTU',  390, 8.0,  38, 1.0, 'open'),
  ('AMB', 'SMP',  380, 8.0,  37, 1.0, 'open'),
  ('DIE', 'SMP',  280, 6.0,  27, 1.0, 'open'),
  ('TNR', 'MOR',  620, 12.0, 60, 1.0, 'open');

-- ─── Utilisateurs de test ────────────────────────────────────
INSERT IGNORE INTO users (username, email, password, role) VALUES
  ('admin',      'admin@smarttransport.mg',   'admin123',    'admin'),
  ('rakoto',     'rakoto@example.mg',         'pass123',     'passenger'),
  ('chauffeur1', 'chauffeur@example.mg',       'pass123',     'driver');

-- ─── Véhicules ───────────────────────────────────────────────
INSERT IGNORE INTO vehicles (plate, capacity, status) VALUES
  ('TXBR-001', 15, 'available'),
  ('TXBR-002', 18, 'available'),
  ('TXBR-003', 12, 'on_route');
