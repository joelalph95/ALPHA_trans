-- Création de la base de données
CREATE DATABASE IF NOT EXISTS smarttransport_db;
USE smarttransport_db;

-- 1. Coopératives (doit être créée avant Utilisateurs)
CREATE TABLE Cooperatives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    contact VARCHAR(100)
);

-- 2. Utilisateurs
CREATE TABLE Utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    mot_de_passe VARCHAR(255),
    role ENUM('passager', 'chauffeur', 'cooperative', 'admin') NOT NULL,
    telephone VARCHAR(20),
    cooperative_id INT NULL,
    FOREIGN KEY (cooperative_id) REFERENCES Cooperatives(id)
);

-- 3. Villes
CREATE TABLE Villes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL
);

-- 4. Routes
CREATE TABLE Routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ville_depart_id INT NOT NULL,
    ville_arrivee_id INT NOT NULL,
    distance FLOAT NOT NULL,          -- en km
    etat ENUM('ouverte', 'fermee') DEFAULT 'ouverte',
    trafic INT DEFAULT 1,            -- niveau 1 (fluide) à 5 (bouchon)
    FOREIGN KEY (ville_depart_id) REFERENCES Villes(id),
    FOREIGN KEY (ville_arrivee_id) REFERENCES Villes(id)
);

-- 5. Véhicules
CREATE TABLE Vehicules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    immatriculation VARCHAR(20) UNIQUE NOT NULL,
    capacite INT NOT NULL,            -- nombre maximum de passagers
    carburant_max FLOAT,              -- réservoir en litres
    cooperative_id INT,
    FOREIGN KEY (cooperative_id) REFERENCES Cooperatives(id)
);

-- 6. Demandes de passagers
CREATE TABLE Demandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    passager_id INT,
    ville_depart_id INT,
    ville_arrivee_id INT,
    date_demande DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'acceptee', 'refusee') DEFAULT 'en_attente',
    FOREIGN KEY (passager_id) REFERENCES Utilisateurs(id),
    FOREIGN KEY (ville_depart_id) REFERENCES Villes(id),
    FOREIGN KEY (ville_arrivee_id) REFERENCES Villes(id)
);

-- 7. Réservations / remplissage effectif
CREATE TABLE Reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    demande_id INT,
    vehicule_id INT,
    chauffeur_id INT,
    date_depart DATETIME,
    nombre_places INT,
    FOREIGN KEY (demande_id) REFERENCES Demandes(id),
    FOREIGN KEY (vehicule_id) REFERENCES Vehicules(id),
    FOREIGN KEY (chauffeur_id) REFERENCES Utilisateurs(id)
);

-- 8. Planning des trajets
CREATE TABLE Plannings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cooperative_id INT,
    vehicule_id INT,
    chauffeur_id INT,
    ville_depart_id INT,
    ville_arrivee_id INT,
    date_depart DATETIME,
    statut ENUM('planifie', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    FOREIGN KEY (cooperative_id) REFERENCES Cooperatives(id),
    FOREIGN KEY (vehicule_id) REFERENCES Vehicules(id),
    FOREIGN KEY (chauffeur_id) REFERENCES Utilisateurs(id),
    FOREIGN KEY (ville_depart_id) REFERENCES Villes(id),
    FOREIGN KEY (ville_arrivee_id) REFERENCES Villes(id)
);

-- 9. Logs des modifications
CREATE TABLE Logs_Modifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    action VARCHAR(255),
    table_modifiee VARCHAR(50),
    id_enregistrement INT,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateurs(id)
);

-- 10. Historique du trafic
CREATE TABLE Historique_Trafic (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT,
    niveau_trafic INT,
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES Routes(id)
);