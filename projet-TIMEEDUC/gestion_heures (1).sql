-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 12 mai 2026 à 21:19
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
-- Base de données : `gestion_heures`
--

-- --------------------------------------------------------

--
-- Structure de la table `affectations`
--

DROP TABLE IF EXISTS `affectations`;
CREATE TABLE IF NOT EXISTS `affectations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enseignant_id` int DEFAULT NULL,
  `matiere_id` int DEFAULT NULL,
  `annee_academique` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enseignant_id` (`enseignant_id`),
  KEY `matiere_id` (`matiere_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
CREATE TABLE IF NOT EXISTS `enseignants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int DEFAULT NULL,
  `grade` enum('Assistant','Maître-Assistant','Professeur','Autres') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `statut` enum('Permanent','Vacataire') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departement` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `taux_horaire` decimal(10,2) DEFAULT NULL,
  `heures_contractuelles` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `utilisateur_id`, `grade`, `statut`, `departement`, `taux_horaire`, `heures_contractuelles`) VALUES
(1, 2, 'Maître-Assistant', 'Permanent', 'MATH', 300.00, 120),
(4, 15, 'Professeur', 'Permanent', 'INFORMATIQUE', 50000.00, 120),
(5, 16, 'Professeur', 'Vacataire', 'HG', 50000.00, 120),
(6, 17, 'Professeur', 'Permanent', 'INFORMATIQUE', 25000.00, 50),
(8, 23, 'Professeur', 'Vacataire', 'INFORMATIQUE', 20000.00, 80),
(9, 24, 'Professeur', 'Permanent', 'INFORMATIQUE', 25000.00, 50),
(10, 25, 'Professeur', 'Vacataire', 'INFORMATIQUE', 25000.00, 40);

-- --------------------------------------------------------

--
-- Structure de la table `heures_effectuees`
--

DROP TABLE IF EXISTS `heures_effectuees`;
CREATE TABLE IF NOT EXISTS `heures_effectuees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enseignant_id` int DEFAULT NULL,
  `matiere_id` int DEFAULT NULL,
  `date_cours` date DEFAULT NULL,
  `type_heure` enum('CM','TD','TP') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `duree` decimal(4,2) DEFAULT NULL,
  `salle` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observations` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `enseignant_id` (`enseignant_id`),
  KEY `matiere_id` (`matiere_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `heures_effectuees`
--

INSERT INTO `heures_effectuees` (`id`, `enseignant_id`, `matiere_id`, `date_cours`, `type_heure`, `duree`, `salle`, `observations`) VALUES
(2, 4, 2, '2026-05-10', 'TD', 4.00, 'A12', ''),
(3, 6, 2, '2026-05-07', 'CM', 4.00, 'A1', '');

-- --------------------------------------------------------

--
-- Structure de la table `logs`
--

DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intitule` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `filiere` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `niveau` enum('L1','L2','L3','M1','M2') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `volume_horaire_prevu` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `intitule`, `filiere`, `niveau`, `volume_horaire_prevu`) VALUES
(1, 'LECTURE', 'MATH', 'L1', 5),
(2, 'INFORMATIQUE', 'DEVELOPPEMENT', 'L3', 6),
(3, 'COMPTABILITE', 'RGL', 'L2', 30),
(4, 'INFORMATIQUE', 'RGL', 'M1', 50);

-- --------------------------------------------------------

--
-- Structure de la table `parametres`
--

DROP TABLE IF EXISTS `parametres`;
CREATE TABLE IF NOT EXISTS `parametres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `annee_academique` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `equivalence_cm` decimal(4,2) DEFAULT '1.50',
  `equivalence_tp` decimal(4,2) DEFAULT '0.75',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parametres`
--

INSERT INTO `parametres` (`id`, `annee_academique`, `equivalence_cm`, `equivalence_tp`) VALUES
(1, '2025-2026', 1.00, 1.00);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('admin','rh','enseignant') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mot_de_passe_affichage` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `created_at`, `mot_de_passe_affichage`) VALUES
(1, 'Admin', 'Super', 'admin@gestion.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '2026-05-05 15:51:00', 'password'),
(2, 'kouahou', 'ange', 'bijoce432@gmail.com', '$2b$10$tU1k3PDy2RXu5JDa8eeCrecR0wIeSV4Gb9XEbrDkgg.jdEixJLegq', 'enseignant', '2026-05-05 22:50:16', NULL),
(15, 'COULIBALY', 'MOUSSA', 'moussa64@gmail.com', '$2b$10$JHqvII6ZYj8msgH5e8qbMuDitthH/QOAFuIJTc3BzH4T1jFsAb78y', 'enseignant', '2026-05-06 09:18:54', NULL),
(16, 'IRIE', 'ANGE', 'irie64@gmail.com', '$2b$10$OwTC8SHEXDjWikpS3DXPM.qyJZqNIhCPx9/5M9ooHeu5nW5rgF45q', 'enseignant', '2026-05-06 10:24:24', NULL),
(17, 'TOURE', 'ALI', 'ali64@gmail.com', '$2b$10$/C1XqSo5v6DqsHQT0jRQc.a/WyFsOiAzGEqhdZOxx2i2h2BY709cK', 'enseignant', '2026-05-07 13:11:01', '12345'),
(22, 'TIA', 'JOCELYNE', 'tia@gmail.com', '$2b$10$B529LTDBaltvAkscvX3TO.BhmSqJ.bDUVL2Whv3DbvJHOhjQ3oj8u', 'rh', '2026-05-08 00:46:51', '12345'),
(23, 'KOFFI', 'ALI', 'ali@gmail.com', '$2b$10$MHhB7h4LxCUYblpuY4xMfOC25VF4Eh96k3HZInIwDeyHFEirK/nLO', 'enseignant', '2026-05-10 15:20:05', '12345'),
(24, 'IRIE', 'FRANCK', 'irie@gmail.com', '$2b$10$4SMA3iSAb4H28Vj2aIpXduh0BMAlqVDANFkaDTc2U1oyZsPkcYEvG', 'enseignant', '2026-05-12 17:03:27', '12345'),
(25, 'serre', 'aya', 'aya@gmail.com', '$2b$10$0X/9Quy5SAjzThZ4FRyt1.bkcsIeeuzsa/.tEAcpAzzBhspi8hzZ6', 'enseignant', '2026-05-12 20:38:08', '12345');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `affectations`
--
ALTER TABLE `affectations`
  ADD CONSTRAINT `affectations_ibfk_1` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`),
  ADD CONSTRAINT `affectations_ibfk_2` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`);

--
-- Contraintes pour la table `enseignants`
--
ALTER TABLE `enseignants`
  ADD CONSTRAINT `enseignants_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `heures_effectuees`
--
ALTER TABLE `heures_effectuees`
  ADD CONSTRAINT `heures_effectuees_ibfk_1` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`),
  ADD CONSTRAINT `heures_effectuees_ibfk_2` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`);

--
-- Contraintes pour la table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
