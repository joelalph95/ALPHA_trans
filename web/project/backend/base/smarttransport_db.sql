-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 13 mai 2026 à 06:04
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `smarttransport_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `cooperatives`
--

DROP TABLE IF EXISTS `cooperatives`;
CREATE TABLE IF NOT EXISTS `cooperatives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `cooperatives`
--

INSERT INTO `cooperatives` (`id`, `nom`, `adresse`, `contact`) VALUES
(1, 'Coopérative Analamanga', 'Lot 123 Ambohijatovo, Antananarivo', '032 00 123 45'),
(2, 'Coopérative Atsinanana', 'Boulevard de la Libération, Toamasina', '034 00 123 45'),
(3, 'Coopérative Vakinankaratra', 'Avenue de l\'Indépendance, Antsirabe', '033 00 123 45');

-- --------------------------------------------------------

--
-- Structure de la table `demandes`
--

DROP TABLE IF EXISTS `demandes`;
CREATE TABLE IF NOT EXISTS `demandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passager_id` int DEFAULT NULL,
  `ville_depart_id` int DEFAULT NULL,
  `ville_arrivee_id` int DEFAULT NULL,
  `date_demande` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` enum('en_attente','acceptee','refusee') DEFAULT 'en_attente',
  PRIMARY KEY (`id`),
  KEY `passager_id` (`passager_id`),
  KEY `ville_depart_id` (`ville_depart_id`),
  KEY `ville_arrivee_id` (`ville_arrivee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `demandes`
--

INSERT INTO `demandes` (`id`, `passager_id`, `ville_depart_id`, `ville_arrivee_id`, `date_demande`, `statut`) VALUES
(1, 2, 1, 2, '2026-05-06 15:37:01', 'acceptee'),
(2, 2, 1, 3, '2026-05-06 15:37:01', 'acceptee'),
(3, 3, 1, 4, '2026-05-06 15:37:01', 'acceptee'),
(4, 3, 2, 3, '2026-05-06 15:37:01', 'acceptee'),
(5, 4, 3, 1, '2026-05-06 15:37:01', 'acceptee'),
(6, 4, 5, 7, '2026-05-06 15:37:01', 'acceptee'),
(7, 10, 1, 3, '2026-05-06 15:39:34', 'acceptee'),
(8, 10, 13, 1, '2026-05-06 15:45:05', 'acceptee'),
(9, 10, 17, 3, '2026-05-06 16:36:23', 'acceptee'),
(10, 10, 17, 1, '2026-05-06 16:46:13', 'acceptee'),
(11, 10, 17, 15, '2026-05-06 16:47:57', 'acceptee'),
(12, 10, 17, 1, '2026-05-06 17:04:13', 'acceptee'),
(13, 10, 17, 15, '2026-05-08 18:06:47', 'acceptee'),
(14, 10, 13, 1, '2026-05-08 18:10:53', 'refusee'),
(15, 10, 17, 1, '2026-05-08 18:54:46', 'acceptee'),
(16, 10, 13, 1, '2026-05-08 18:56:44', 'acceptee'),
(17, 10, 1, 15, '2026-05-08 18:57:10', 'acceptee'),
(18, 10, 1, 15, '2026-05-08 19:24:11', 'acceptee'),
(19, 10, 13, 17, '2026-05-09 16:00:48', 'acceptee'),
(20, 10, 13, 1, '2026-05-09 16:01:04', 'acceptee'),
(21, 10, 13, 17, '2026-05-09 19:25:50', 'acceptee'),
(22, 10, 13, 1, '2026-05-09 19:27:48', 'acceptee'),
(23, 10, 17, 13, '2026-05-09 19:34:02', 'acceptee'),
(24, 10, 1, 15, '2026-05-09 19:34:24', 'acceptee'),
(25, 10, 17, 1, '2026-05-09 19:36:22', 'acceptee'),
(26, 10, 12, 3, '2026-05-10 17:21:45', 'acceptee'),
(27, 10, 13, 17, '2026-05-12 11:37:47', 'acceptee'),
(28, 10, 1, 3, '2026-05-13 00:53:07', 'en_attente');

-- --------------------------------------------------------

--
-- Structure de la table `historique_trafic`
--

DROP TABLE IF EXISTS `historique_trafic`;
CREATE TABLE IF NOT EXISTS `historique_trafic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int DEFAULT NULL,
  `niveau_trafic` int DEFAULT NULL,
  `date_heure` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `historique_trafic`
--

INSERT INTO `historique_trafic` (`id`, `route_id`, `niveau_trafic`, `date_heure`) VALUES
(1, 3, 3, '2026-05-06 08:00:00'),
(2, 3, 4, '2026-05-06 12:00:00'),
(3, 3, 3, '2026-05-06 16:00:00'),
(4, 67, 3, '2026-05-08 18:15:56'),
(5, 67, 1, '2026-05-08 18:16:03');

-- --------------------------------------------------------

--
-- Structure de la table `logs_modifications`
--

DROP TABLE IF EXISTS `logs_modifications`;
CREATE TABLE IF NOT EXISTS `logs_modifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `table_modifiee` varchar(50) DEFAULT NULL,
  `id_enregistrement` int DEFAULT NULL,
  `date_modification` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `logs_modifications`
--

INSERT INTO `logs_modifications` (`id`, `utilisateur_id`, `action`, `table_modifiee`, `id_enregistrement`, `date_modification`) VALUES
(1, 1, 'Ajout ville', 'Villes', 1, '2026-05-01 10:00:00'),
(2, 1, 'Ajout ville', 'Villes', 2, '2026-05-01 10:05:00'),
(3, 1, 'Ajout route', 'Routes', 1, '2026-05-01 10:30:00'),
(4, 1, 'Modification trafic', 'Routes', 3, '2026-05-02 14:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `plannings`
--

DROP TABLE IF EXISTS `plannings`;
CREATE TABLE IF NOT EXISTS `plannings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cooperative_id` int DEFAULT NULL,
  `vehicule_id` int DEFAULT NULL,
  `chauffeur_id` int DEFAULT NULL,
  `ville_depart_id` int DEFAULT NULL,
  `ville_arrivee_id` int DEFAULT NULL,
  `date_depart` datetime DEFAULT NULL,
  `statut` enum('planifie','en_cours','termine','annule') DEFAULT 'planifie',
  PRIMARY KEY (`id`),
  KEY `cooperative_id` (`cooperative_id`),
  KEY `vehicule_id` (`vehicule_id`),
  KEY `chauffeur_id` (`chauffeur_id`),
  KEY `ville_depart_id` (`ville_depart_id`),
  KEY `ville_arrivee_id` (`ville_arrivee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `plannings`
--

INSERT INTO `plannings` (`id`, `cooperative_id`, `vehicule_id`, `chauffeur_id`, `ville_depart_id`, `ville_arrivee_id`, `date_depart`, `statut`) VALUES
(1, 1, 1, 6, 1, 2, '2026-05-10 07:30:00', 'planifie'),
(2, 1, 2, 7, 1, 3, '2026-05-11 08:00:00', 'planifie'),
(3, 1, 1, 6, 2, 1, '2026-05-10 15:00:00', 'en_cours'),
(4, 2, 3, 8, 5, 7, '2026-05-12 06:00:00', 'planifie'),
(5, 3, 5, 6, 3, 4, '2026-05-13 07:00:00', 'planifie');

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `demande_id` int DEFAULT NULL,
  `vehicule_id` int DEFAULT NULL,
  `chauffeur_id` int DEFAULT NULL,
  `date_depart` datetime DEFAULT NULL,
  `nombre_places` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `demande_id` (`demande_id`),
  KEY `vehicule_id` (`vehicule_id`),
  KEY `chauffeur_id` (`chauffeur_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `demande_id`, `vehicule_id`, `chauffeur_id`, `date_depart`, `nombre_places`) VALUES
(1, 3, 1, 6, '2026-05-10 08:00:00', 1),
(2, 8, 1, 11, '2026-05-06 15:51:06', 1),
(3, 7, 1, 11, '2026-05-06 15:51:06', 1),
(4, 6, 1, 11, '2026-05-06 15:51:06', 1),
(5, 5, 1, 11, '2026-05-06 15:51:06', 1),
(6, 4, 1, 11, '2026-05-06 15:51:06', 1),
(7, 2, 1, 11, '2026-05-06 15:51:06', 1),
(8, 1, 1, 11, '2026-05-06 15:51:06', 1),
(9, 12, 1, 11, '2026-05-08 17:59:23', 1),
(10, 11, 1, 11, '2026-05-08 17:59:23', 1),
(11, 13, 1, 11, '2026-05-08 18:07:15', 1),
(12, 17, 1, 11, '2026-05-08 19:15:16', 1),
(13, 16, 1, 11, '2026-05-08 19:15:16', 1),
(14, 15, 1, 11, '2026-05-08 19:15:16', 1),
(15, 26, 1, 11, '2026-05-12 10:43:52', 1);

-- --------------------------------------------------------

--
-- Structure de la table `routes`
--

DROP TABLE IF EXISTS `routes`;
CREATE TABLE IF NOT EXISTS `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ville_depart_id` int NOT NULL,
  `ville_arrivee_id` int NOT NULL,
  `distance` float NOT NULL,
  `etat` enum('ouverte','fermee') DEFAULT 'ouverte',
  `trafic` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `ville_depart_id` (`ville_depart_id`),
  KEY `ville_arrivee_id` (`ville_arrivee_id`)
) ENGINE=MyISAM AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `routes`
--

INSERT INTO `routes` (`id`, `ville_depart_id`, `ville_arrivee_id`, `distance`, `etat`, `trafic`) VALUES
(1, 1, 2, 355, 'ouverte', 2),
(2, 2, 1, 355, 'ouverte', 2),
(3, 1, 3, 170, 'ouverte', 3),
(4, 3, 1, 170, 'ouverte', 3),
(5, 1, 4, 410, 'ouverte', 2),
(6, 4, 1, 410, 'ouverte', 2),
(7, 1, 5, 552, '', 2),
(8, 5, 1, 552, '', 2),
(9, 1, 6, 1100, '', 2),
(10, 6, 1, 1100, '', 2),
(11, 1, 7, 1100, '', 1),
(12, 7, 1, 1100, '', 1),
(13, 1, 8, 650, '', 1),
(14, 8, 1, 650, '', 1),
(15, 1, 12, 115, 'ouverte', 3),
(16, 12, 1, 115, 'ouverte', 3),
(17, 1, 18, 210, '', 1),
(18, 18, 1, 210, '', 1),
(19, 2, 4, 765, '', 2),
(20, 4, 2, 765, '', 2),
(21, 2, 12, 240, 'ouverte', 2),
(22, 12, 2, 240, 'ouverte', 2),
(23, 2, 10, 150, '', 1),
(24, 10, 2, 150, '', 1),
(25, 2, 19, 200, '', 1),
(26, 19, 2, 200, '', 1),
(27, 2, 20, 400, '', 1),
(28, 20, 2, 400, '', 1),
(29, 3, 4, 240, 'ouverte', 2),
(30, 4, 3, 240, 'ouverte', 2),
(31, 3, 5, 760, '', 1),
(32, 5, 3, 760, '', 1),
(33, 3, 8, 560, '', 1),
(34, 8, 3, 560, '', 1),
(35, 3, 17, 90, 'ouverte', 2),
(36, 17, 3, 90, 'ouverte', 2),
(37, 3, 18, 350, '', 1),
(38, 18, 3, 350, '', 1),
(39, 4, 6, 535, '', 1),
(40, 6, 4, 535, '', 1),
(41, 4, 14, 180, '', 2),
(42, 14, 4, 180, '', 2),
(43, 4, 17, 150, 'ouverte', 2),
(44, 17, 4, 150, 'ouverte', 2),
(45, 4, 11, 620, '', 1),
(46, 11, 4, 620, '', 1),
(47, 5, 7, 580, '', 1),
(48, 7, 5, 580, '', 1),
(49, 5, 15, 350, '', 1),
(50, 15, 5, 350, '', 1),
(51, 5, 16, 250, '', 1),
(52, 16, 5, 250, '', 1),
(53, 5, 9, 450, '', 1),
(54, 9, 5, 450, '', 1),
(55, 6, 8, 350, '', 1),
(56, 8, 6, 350, '', 1),
(57, 6, 11, 420, '', 1),
(58, 11, 6, 420, '', 1),
(59, 7, 9, 180, '', 1),
(60, 9, 7, 180, '', 1),
(61, 7, 15, 400, '', 1),
(62, 15, 7, 400, '', 1),
(63, 7, 20, 300, '', 1),
(64, 20, 7, 300, '', 1),
(65, 8, 18, 450, '', 1),
(66, 18, 8, 450, '', 1),
(67, 13, 12, 170, '', 1),
(68, 12, 13, 170, '', 1),
(69, 13, 2, 250, '', 1),
(70, 2, 13, 250, '', 1),
(71, 14, 19, 250, '', 1),
(72, 19, 14, 250, '', 1),
(73, 16, 1, 330, '', 1),
(74, 1, 16, 330, '', 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `role` enum('passager','chauffeur','cooperative','admin') NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `cooperative_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `cooperative_id` (`cooperative_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `email`, `mot_de_passe`, `role`, `telephone`, `cooperative_id`) VALUES
(1, 'Admin Principal', 'admin@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'admin', '032 00 000 01', NULL),
(2, 'Jean Rakoto', 'jean@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'passager', '032 00 000 02', NULL),
(3, 'Lala Rasoa', 'lala@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'passager', '032 00 000 03', NULL),
(4, 'Miora Andry', 'miora@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'passager', '032 00 000 04', NULL),
(5, 'Rabe Andriamora', 'rabe@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'chauffeur', '034 00 000 05', 1),
(6, 'Koto Rasolofo', 'koto@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'chauffeur', '034 00 000 06', 1),
(7, 'Doda Fidy', 'doda@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'chauffeur', '034 00 000 07', 2),
(8, 'Manager Coop Tana', 'coop@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'cooperative', '032 00 000 08', 1),
(9, 'Manager Coop Toamasina', 'coop2@smart.mg', '$2a$10$Qf0aMh3v7h4.5JhEJFJTfOUiEYqZ8KZ4RqIo7NOb9CVL9qNlOqxpm', 'cooperative', '034 00 000 09', 2),
(10, 'jo', 'passager@gmail.com', '$2a$10$tkqAOe8FzLqBIVQPtuUCOuve4q2qt7jNWdSEzTBs1KVhDl6u2XvTW', 'passager', '123456', NULL),
(11, 'hh', 'chauffeur@gmail.com', '$2a$10$R5lE2IfSSOr3xSGPBs3fc.Z3okMIjetjMQb1VrxWSQd7W0Bg9vpDO', 'chauffeur', '0342452039', NULL),
(12, 'admin', 'admin@gmail.com', '$2a$10$D2ZoUL0gDqrh20EwXTovFe3smEusyHJTeHCn843XUSIXbdS64thHW', 'admin', '0342452039', NULL),
(13, 'cooperative', 'cooperative@gmail.com', '$2a$10$FX5jNiMrFhNF1PLxKs/zn.dPFrKlXgUZdvp3vOkrXgNEBwH3DSCpu', 'cooperative', '+261342452039', NULL),
(14, 'joel Alpha Ramandimbison', 'joelalpha50@gmail.com', '$2a$10$a9ZCBd6u1Ki5ieVqFmiQgOwvVnQntolwN6vFjzvNDdxCgfcpcAgUO', 'admin', '+261342452039', NULL),
(15, 'Alan', 'alan@gmail.com', '$2a$10$gJ7sRDxA.7yvc4mZxwKgFu/1OxlwXo1lF1UOJ.mU7l2W/oqIhGTea', 'chauffeur', '0345241564', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `vehicules`
--

DROP TABLE IF EXISTS `vehicules`;
CREATE TABLE IF NOT EXISTS `vehicules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `immatriculation` varchar(20) NOT NULL,
  `capacite` int NOT NULL,
  `carburant_max` float DEFAULT NULL,
  `cooperative_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `immatriculation` (`immatriculation`),
  KEY `cooperative_id` (`cooperative_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `vehicules`
--

INSERT INTO `vehicules` (`id`, `immatriculation`, `capacite`, `carburant_max`, `cooperative_id`) VALUES
(1, '1234 TAB', 18, 80, 1),
(2, '5678 TBA', 20, 100, 1),
(3, '9101 TBC', 25, 120, 2),
(4, '2345 TAD', 15, 70, 1),
(5, '6789 TBE', 22, 90, 3);

-- --------------------------------------------------------

--
-- Structure de la table `villes`
--

DROP TABLE IF EXISTS `villes`;
CREATE TABLE IF NOT EXISTS `villes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `villes`
--

INSERT INTO `villes` (`id`, `nom`, `latitude`, `longitude`) VALUES
(1, 'Antananarivo', -18.8792, 47.5079),
(2, 'Toamasina', -18.1499, 49.4023),
(3, 'Antsirabe', -19.865, 47.0333),
(4, 'Fianarantsoa', -21.4536, 47.0857),
(5, 'Mahajanga', -15.7167, 46.3167),
(6, 'Toliara', -23.3569, 43.69),
(7, 'Diego Suarez', -12.2797, 49.2917),
(8, 'Morondava', -20.2904, 44.2823),
(9, 'Nosy Be', -13.315, 48.2667),
(10, 'Sainte Marie', -17.0833, 49.8167),
(11, 'Fort Dauphin', -25.0375, 46.9833),
(12, 'Moramanga', -18.9333, 48.2167),
(13, 'Ambatondrazaka', -17.8333, 48.4167),
(14, 'Manakara', -22.1333, 48.0167),
(15, 'Antsohihy', -14.8833, 47.9833),
(16, 'Maevatanana', -16.95, 46.8333),
(17, 'Ambositra', -20.5167, 47.25),
(18, 'Tsiroanomandidy', -18.7333, 46.05),
(19, 'Mahanoro', -19.9, 48.8),
(20, 'Maroantsetra', -15.4333, 49.75);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
