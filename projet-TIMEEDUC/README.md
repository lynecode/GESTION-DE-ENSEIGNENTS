Structure générale du projet
projet-TIMEEDUC/
├── backend/         → Serveur Node.js (cerveau de l'application)
└── frontend/        → Interface utilisateur (ce que l'utilisateur voit)
________________________________________
BACKEND
server.js
C'est le point d'entrée du serveur. Il démarre l'application sur le port 3000 et connecte toutes les routes.
config/db.js
Gère la connexion à la base de données MySQL. Tous les fichiers qui ont besoin de la base de données l'importent depuis ici.
middlewares/authMiddleware.js
C'est le gardien de sécurité. Il vérifie que chaque requête contient un token valide avant d'autoriser l'accès aux données.
Controllers
Ce sont les cerveaux de chaque fonctionnalité :
•	authController.js → Gère la connexion
•	enseignantsController.js → Ajouter, modifier, supprimer les enseignants
•	matieresController.js → Gérer les matières
•	heuresController.js → Saisir et calculer les heures
•	utilisateursController.js → Créer les comptes
•	statistiquesController.js → Calculer les statistiques
•	parametresController.js → Gérer l'année académique
•	exportsController.js → Générer PDF et Excel
•	importController.js → Importer depuis Excel
Routes
Ce sont les adresses URL de l'application. Chaque route relie une URL à un controller :
•	/api/auth → authentification
•	/api/enseignants → gestion enseignants
•	/api/heures → gestion heures
•	/api/exports → exports PDF/Excel
________________________________________
FRONTEND
index.html + login.js + login.css
C'est la page de connexion. L'utilisateur entre son email et mot de passe. Selon son rôle, il est redirigé vers son espace.
Dossier admin/
•	dashboard.html → Tableau de bord avec statistiques, historique, enseignants récents
•	enseignants.html → Liste et gestion des enseignants avec import Excel
•	matieres.html → Gestion des matières
•	stats.html → Graphiques et statistiques
•	exports.html → Télécharger PDF et Excel
•	parametres.html → Définir l'année académique et équivalences
•	utilisateurs.html → Créer des comptes Admin, RH et Enseignant
Dossier rh/
•	dashboard.html → Tableau de bord RH
•	heures.html → Saisir les heures des enseignants
•	paiements.html → Voir et imprimer les états de paiement
•	statistiques.html → Suivi des dépassements avec graphiques
•	exports.html → Exporter les données
Dossier enseignant/
•	dashboard.html → Tableau de bord personnel avec message de bienvenue
•	mes-heures.html → Consulter ses propres heures
•	mon-recapitulatif.html → Voir et imprimer son récapitulatif avec montant à payer
Dossier styles/
•	login.css → Style de la page de connexion
•	dashboard.css → Style des tableaux de bord
•	enseignants.css → Style des pages avec tableaux et formulaires
Dossier js/
Chaque page HTML a son fichier JS correspondant qui gère les appels API et l'affichage des données.
________________________________________
Base de données
6 tables principales :
•	utilisateurs → tous les comptes (admin, RH, enseignant)
•	enseignants → informations détaillées des enseignants
•	matieres → les cours
•	heures_effectuees → les heures saisies par la RH
•	affectations → lien entre enseignants et matières
•	parametres → année académique et équivalences

