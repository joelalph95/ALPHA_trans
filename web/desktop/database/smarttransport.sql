-- database/smarttransport.sql
CREATE DATABASE IF NOT EXISTS smarttransport;
USE smarttransport;

-- Table des Villes
CREATE TABLE villes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    coord_x DOUBLE NOT NULL,
    coord_y DOUBLE NOT NULL,
    population INT DEFAULT 0
);

-- Table des Routes
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ville_depart INT,
    ville_arrivee INT,
    distance_km DOUBLE NOT NULL,
    temps_moyen INT NOT NULL, -- en minutes
    etat VARCHAR(50) DEFAULT 'Normale',
    trafic INT DEFAULT 0, -- 0:normal, 1:modere, 2:dens, 3:bouchon
    FOREIGN KEY (ville_depart) REFERENCES villes(id),
    FOREIGN KEY (ville_arrivee) REFERENCES villes(id)
);

-- Table des Véhicules
CREATE TABLE vehicules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    immatriculation VARCHAR(50) UNIQUE,
    capacite_max INT NOT NULL,
    places_occupees INT DEFAULT 0,
    carburant_litres DOUBLE DEFAULT 50,
    consommation_km DOUBLE DEFAULT 0.25,
    chauffeur_nom VARCHAR(100),
    cooperative_id INT
);

-- Table des Trajets
CREATE TABLE trajets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicule_id INT,
    date_depart DATETIME,
    heure_depart TIME,
    itineraire TEXT, -- JSON string
    places_disponibles INT,
    statut VARCHAR(50) DEFAULT 'Planifie',
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id)
);

-- Table des Utilisateurs
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('passager', 'chauffeur', 'cooperative', 'admin') DEFAULT 'passager'
);

-- Insertion de données test
INSERT INTO villes (nom, coord_x, coord_y) VALUES
('Antananarivo', -18.8792, 47.5079),
('Antsirabe', -19.8662, 47.0333),
('Fianarantsoa', -21.4545, 47.0875),
('Toamasina', -18.1445, 49.3958),
('Mahajanga', -15.6922, 46.3382);

INSERT INTO routes (ville_depart, ville_arrivee, distance_km, temps_moyen) VALUES
(1, 2, 170, 210), (2, 3, 290, 360), (1, 4, 350, 420), (1, 5, 570, 660);

-- Insertion de données de test pour les utilisateurs
-- Passager: password123 (bcrypt hashed)
-- Chauffeur: password123
-- Coopérative: password123
-- Admin: password123
INSERT INTO utilisateurs (nom, email, password, role) VALUES
('Jean Passager', 'passager@smarttransport.mg', '$2a$10$YOvVJDXz.DZ5V8/X0/V7WO0Z0ZE0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'passager'),
('Marie Chauffeur', 'chauffeur@smarttransport.mg', '$2a$10$YOvVJDXz.DZ5V8/X0/V7WO0Z0ZE0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'chauffeur'),
('Pierre Coopérative', 'cooperative@smarttransport.mg', '$2a$10$YOvVJDXz.DZ5V8/X0/V7WO0Z0ZE0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'cooperative'),
('Admin System', 'admin@smarttransport.mg', '$2a$10$YOvVJDXz.DZ5V8/X0/V7WO0Z0ZE0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'admin');
