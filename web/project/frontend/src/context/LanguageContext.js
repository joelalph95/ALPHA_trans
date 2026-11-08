import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'fr', t: (key) => key, changeLanguage: () => {} };
  }
  return context;
};

// ==================== TRADUCTIONS COMPLÈTES ====================

export const translations = {
  // ==================== FRANÇAIS ====================
  fr: {
    // Navigation
    'nav.logout': 'Déconnexion',
    'nav.dashboard': 'Tableau de bord',
    
    // Commun
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.search': 'Rechercher',
    'common.reset': 'Réinitialiser',
    'common.all': 'Tous',
    'common.add': 'Ajouter',
    'common.refresh': 'Actualiser',
    'common.select': 'Sélectionner',
    'common.confirmDelete': 'Supprimer cet élément ?',
    
    // Login
    'login.title': 'Connexion',
    'login.subtitle': 'Ravi de vous revoir !',
    'login.email': 'Adresse email',
    'login.password': 'Mot de passe',
    'login.remember': 'Se souvenir de moi',
    'login.forgot': 'Mot de passe oublié ?',
    'login.button': 'Se connecter',
    'login.noAccount': 'Pas encore de compte ?',
    'login.register': 'Inscrivez-vous',
    'login.error': 'Email ou mot de passe incorrect',
    
    // Register
    'register.title': 'Inscription',
    'register.subtitle': 'Créez votre compte et rejoignez-nous',
    'register.name': 'Nom complet',
    'register.namePlaceholder': 'Votre nom et prénom',
    'register.email': 'Adresse email',
    'register.emailPlaceholder': 'votre@email.com',
    'register.password': 'Mot de passe',
    'register.passwordPlaceholder': '8 caractères minimum',
    'register.role': 'Rôle',
    'register.phone': 'Téléphone',
    'register.phonePlaceholder': 'Votre numéro de téléphone',
    'register.button': "S'inscrire",
    'register.haveAccount': 'Déjà un compte ?',
    'register.login': 'Connectez-vous',
    'register.passenger': 'Passager',
    'register.driver': 'Chauffeur',
    'register.cooperative': 'Coopérative',
    'register.error': "Erreur lors de l'inscription",
    'register.errorRequired': 'Veuillez remplir tous les champs obligatoires.',
    
    // Dashboard Passager
    'passenger.welcome': 'Bienvenue',
    'passenger.search': 'Rechercher un trajet',
    'passenger.home': 'Accueil',
    'passenger.departure': 'Ville de départ',
    'passenger.arrival': "Ville d'arrivée",
    'passenger.searchButton': 'Rechercher',
    'passenger.route': 'Itinéraire optimal',
    'passenger.distance': 'Distance totale',
    'passenger.time': 'Temps estimé',
    'passenger.cost': 'Coût estimé',
    'passenger.book': 'Réserver ce trajet',
    'passenger.myTrips': 'Mes demandes',
    'passenger.accepted': 'Acceptées',
    'passenger.pending': 'En attente',
    'passenger.refused': 'Refusées',
    'passenger.newRequest': 'Nouvelle demande',
    'passenger.noTrips': 'Aucune demande pour le moment',
    'passenger.howItWorks': 'Comment ça marche ?',
    'passenger.step1': 'Recherchez',
    'passenger.step2': 'Consultez',
    'passenger.step3': 'Demandez',
    'passenger.selectCity': 'Choisir la ville...',
    'passenger.selectRouteFirst': 'Veuillez d’abord rechercher un trajet.',
    'passenger.selectDifferentCities': 'Veuillez choisir deux villes différentes.',
    'passenger.ready': 'Prêt pour votre prochain voyage à Madagascar ?',
    'passenger.routeDetails': 'Détails du voyage',
    'passenger.date': 'Date',
    
    // Dashboard Chauffeur
    'driver.myTrips': 'Mes trajets',
    'driver.schedule': 'Planning',
    'driver.vehicle': 'Véhicule',
    'driver.date': 'Date',
    'driver.status': 'Statut',
    'driver.actions': 'Actions',
    'driver.start': 'Démarrer',
    'driver.finish': 'Terminer',
    'driver.waitingRequests': 'Demandes en attente',
    'driver.passenger': 'Passager',
    'driver.accept': 'Accepter',
    'driver.reject': 'Refuser',
    'driver.optimization': 'Optimisation Knapsack',
    'driver.selectVehicle': 'Sélectionnez un véhicule',
    'driver.optimize': "Lancer l'optimisation",
    'driver.optimized': 'Places optimisées',
    'driver.subtitle': 'Gérez vos trajets et optimisez vos places',
    'driver.selectVehicleFirst': 'Veuillez choisir un véhicule',
    'driver.noRequests': 'Aucune demande en attente',
    'driver.noTrips': 'Aucun trajet assigné pour le moment.',
    
    // Dashboard Coopérative
    'coop.planning': 'Planification des trajets',
    'coop.createTrip': 'Créer un trajet',
    'coop.existingTrips': 'Trajets existants',
    'coop.traffic': 'Gestion du trafic',
    'coop.currentTraffic': 'Trafic actuel',
    'coop.newLevel': 'Nouveau niveau',
    'coop.update': 'Mettre à jour',
    'coop.road': 'Route',
    'coop.from': 'De',
    'coop.to': 'Vers',
    'coop.distance': 'Distance (km)',
    'coop.state': 'État',
    'coop.driverId': 'ID Chauffeur',
    'coop.route': 'Trajet',
    
    // Dashboard Admin
    'admin.console': 'Console Administrateur',
    'admin.stats': 'Statistiques',
    'admin.requests': 'Demandes',
    'admin.infrastructure': 'Infrastructure',
    'admin.logs': 'Logs système',
    'admin.cities': 'Gestion des Villes',
    'admin.addCity': 'Ajouter une ville',
    'admin.cityName': 'Nom de la ville',
    'admin.latitude': 'Latitude',
    'admin.longitude': 'Longitude',
    'admin.routes': 'Gestion des Routes',
    'admin.addRoute': 'Ajouter une route',
    'admin.open': 'Ouverte',
    'admin.degraded': 'Dégradée',
    'admin.bad': 'Mauvaise',
    'admin.closed': 'Fermée',
    'admin.noPendingRequests': 'Aucune demande en attente',
    'admin.cityDeleted': 'Ville supprimée',
    'admin.routeDeleted': 'Route supprimée',
    'admin.cityAdded': 'Ville ajoutée avec succès',
    'admin.routeAdded': 'Route ajoutée avec succès',
    'admin.confirmDeleteCity': 'Supprimer cette ville ?',
    'admin.confirmDeleteRoute': 'Supprimer cette route ?',
    'admin.noLogs': 'Aucun log disponible',
    
    // Statuts
    'status.planned': 'Planifié',
    'status.inProgress': 'En cours',
    'status.completed': 'Terminé',
    'status.accepted': 'Acceptée',
    'status.waiting': 'En attente',
    'status.refused': 'Refusée',
    
    // Messages
    'msg.loginSuccess': 'Connexion réussie !',
    'msg.logoutSuccess': 'Déconnexion réussie !',
    'msg.registerSuccess': 'Inscription réussie !',
    'msg.requestSent': 'Demande envoyée avec succès !',
    'msg.requestAccepted': 'Demande acceptée !',
    'msg.requestRefused': 'Demande refusée !',
    'msg.optimizationDone': 'Optimisation terminée !',
    'msg.trafficUpdated': 'Trafic mis à jour !',
    'msg.planningCreated': 'Trajet planifié avec succès',
    
    // Logs
    'logs.performed': 'a effectué',
    'logs.table': 'Table',
    // Historique
  'history.tab': 'Historique',

    // Ajouter dans l'objet fr:
'history.title': 'Historique des réservations',
'history.subtitle': 'Gérez toutes vos demandes de transport en un seul endroit',
'history.total': 'Total',
'history.route': 'Trajet',
'history.date': 'Date de demande',
'history.searchPlaceholder': 'Rechercher par ville...',
'history.all': 'Tous',
'history.noReservations': 'Aucune réservation trouvée',
'history.noMatch': 'Aucune réservation ne correspond à vos critères',
'history.noReservationsYet': "Vous n'avez pas encore effectué de réservation",
'history.of': 'sur',
'history.id': 'ID',
'history.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.',
'msg.requestDeleted': 'Réservation supprimée avec succès',
'msg.sessionExpired': 'Session expirée. Veuillez vous reconnecter.',
'msg.noPermission': "Vous n'avez pas l'autorisation de supprimer cette réservation.",
'msg.notFound': 'Réservation introuvable ou déjà supprimée.',

// Landing Page - Navigation
'nav.home': 'Accueil',
'nav.benefits': 'Avantages',
'nav.destinations': 'Destinations',
'nav.testimonials': 'Témoignages',
'nav.contact': 'Contact',
'nav.login': 'Connexion',
'nav.register': 'Inscription',

// Landing Page - Hero
'hero.badge': 'Transport Premium',
'hero.slide1.title': 'Voyagez à travers Madagascar',
'hero.slide1.subtitle': 'Découvrez les merveilles de la Grande Île en toute sécurité',
'hero.slide2.title': 'Transport fiable et ponctuel',
'hero.slide2.subtitle': 'Des départs garantis à l\'heure pour votre tranquillité',
'hero.slide3.title': 'Optimisation intelligente',
'hero.slide3.subtitle': 'Nos algorithmes trouvent le meilleur itinéraire pour vous',
'hero.slide4.title': 'Prix compétitifs',
'hero.slide4.subtitle': 'Des tarifs abordables pour tous les budgets',
'hero.slide5.title': 'Sécurité avant tout',
'hero.slide5.subtitle': 'Des véhicules entretenus et des chauffeurs qualifiés',
'hero.slide6.title': 'Réseau national',
'hero.slide6.subtitle': 'Connectez-vous à toutes les régions de Madagascar',
'hero.slide7.title': 'Service client 24/7',
'hero.slide7.subtitle': 'Une équipe dédiée pour vous assister à tout moment',
'hero.slide8.title': 'Application mobile',
'hero.slide8.subtitle': 'Réservez et suivez vos trajets depuis votre smartphone',
'hero.start': 'Commencer',
'hero.login': 'Se connecter',

// Landing Page - Stats
'stats.passengers': 'Passagers transportés',
'stats.cities': 'Villes desservies',
'stats.vehicles': 'Véhicules disponibles',
'stats.satisfaction': 'Taux de satisfaction',

// Landing Page - Features
'features.badge': 'Pourquoi nous choisir',
'features.title': 'Une expérience de voyage unique',
'features.subtitle': 'Découvrez les avantages qui font d\'ALPHA trans le leader du transport à Madagascar',
'features.guaranteed.title': 'Départs garantis',
'features.guaranteed.description': 'Horaires fiables et départs assurés quotidiennement',
'features.security.title': 'Sécurité maximale',
'features.security.description': 'Véhicules entretenus et chauffeurs expérimentés',
'features.optimization.title': 'Optimisation intelligente',
'features.optimization.description': 'Algorithmes pour les meilleurs itinéraires',
'features.booking.title': 'Réservation facile',
'features.booking.description': 'Réservez en quelques clics depuis notre plateforme',

// Landing Page - Destinations
'destinations.badge': 'Destinations',
'destinations.title': 'Les trajets les plus populaires',
'destinations.subtitle': 'Parcourez les plus belles routes de Madagascar',

// Landing Page - Testimonials
'testimonials.badge': 'Témoignages',
'testimonials.title': 'Ce que disent nos clients',
'testimonials.subtitle': 'Ils nous ont fait confiance et partagent leur expérience',
'testimonials.content1': 'Service exceptionnel ! Trajets ponctuels et chauffeurs très professionnels.',
'testimonials.content2': 'J\'ai découvert Madagascar grâce à ALPHA trans. Une expérience inoubliable !',
'testimonials.content3': 'Partenariat excellent, gestion des places optimisée et gains augmentés.',
'testimonials.role1': 'Passager régulier',
'testimonials.role2': 'Touriste',
'testimonials.role3': 'Coopérative',

// Landing Page - CTA
'cta.title': 'Prêt à voyager avec ALPHA trans ?',
'cta.subtitle': 'Rejoignez des milliers de passagers qui nous font confiance chaque jour',
'cta.createAccount': 'Créer un compte',
'cta.alreadyRegistered': 'Déjà inscrit ? Se connecter',

// Landing Page - Footer
'footer.description': 'La plateforme révolutionnaire pour optimiser vos trajets en taxi-brousse à Madagascar.',
'footer.quickLinks': 'Liens rapides',
'footer.support': 'Support',
'footer.helpCenter': 'Centre d\'aide',
'footer.faq': 'FAQ',
'footer.terms': 'Conditions générales',
'footer.privacy': 'Politique de confidentialité',
'footer.contact': 'Contact',
'footer.address': 'Antananarivo, Madagascar',
'footer.copyright': '© 2026 ALPHA trans. Tous droits réservés. | Fait avec amour à Madagascar',

// Logout confirmation
'logout.title': 'Déconnexion',
'logout.confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
'logout.confirmButton': 'Se déconnecter',
  },

  // ==================== MALGACHE ====================
  mg: {
    // Navigation
    'nav.logout': 'Fivoahana',
    'nav.dashboard': 'Tabilao',
    
    // Commun
    'common.loading': 'Fandrasana...',
    'common.error': 'Hadisoana',
    'common.success': 'Vita soa',
    'common.save': 'Tehirizo',
    'common.cancel': 'Aoka',
    'common.delete': 'Fafao',
    'common.edit': 'Ovay',
    'common.confirm': 'Hamafino',
    'common.back': 'Hiverina',
    'common.search': 'Karohy',
    'common.reset': 'Averina',
    'common.all': 'Rehetra',
    'common.add': 'Manampy',
    'common.refresh': 'Havaozina',
    'common.select': 'Misafidy',
    'common.confirmDelete': 'Mamoaka an\'ity ?',
    
    // Login
    'login.title': 'Hiditra',
    'login.subtitle': 'Faly mahita anao indray !',
    'login.email': 'Adiresy mailaka',
    'login.password': 'Tenimiafina',
    'login.remember': 'Tadidio aho',
    'login.forgot': 'Nanadino tenimiafina ?',
    'login.button': 'Hiditra',
    'login.noAccount': 'Mbola tsy manana kaonty ?',
    'login.register': 'Misoratra anarana',
    'login.error': 'Mailaka na tenimiafina diso',
    
    // Register
    'register.title': 'Misoratra anarana',
    'register.subtitle': 'Hamorona kaonty sy hanatevin-daharana anay',
    'register.name': 'Anarana feno',
    'register.namePlaceholder': 'Ny anaranao sy fanampiny',
    'register.email': 'Adiresy mailaka',
    'register.emailPlaceholder': 'mailaka@example.com',
    'register.password': 'Tenimiafina',
    'register.passwordPlaceholder': '8 litera fara fahakeliny',
    'register.role': 'Sata',
    'register.phone': 'Laharan-telefaonina',
    'register.phonePlaceholder': 'Ny laharanao',
    'register.button': 'Misoratra anarana',
    'register.haveAccount': 'Efa manana kaonty ?',
    'register.login': 'Hiditra',
    'register.passenger': 'Mpandeha',
    'register.driver': 'Mpamily',
    'register.cooperative': 'Kooperativa',
    'register.error': 'Nisy hadisoana tamin\'ny fisoratana anarana',
    'register.errorRequired': 'Fenoy ny tsy fenoina',
    
    // Dashboard Passager
    'passenger.welcome': 'Tonga soa',
    'passenger.search': 'Karohy lalana',
    'passenger.home': 'Fandraisana',
    'passenger.departure': 'Tanàna niaingana',
    'passenger.arrival': 'Tanàna haleha',
    'passenger.searchButton': 'Karohy',
    'passenger.route': 'Lalana tsara indrindra',
    'passenger.distance': 'Halavirana feno',
    'passenger.time': 'Fotoana tombanana',
    'passenger.cost': 'Vidiny tombanana',
    'passenger.book': 'Manangana toerana',
    'passenger.myTrips': 'Fangatahana ko',
    'passenger.accepted': 'Ekena',
    'passenger.pending': 'Miandry',
    'passenger.refused': 'Nolavina',
    'passenger.newRequest': 'Fangatahana vaovao',
    'passenger.noTrips': 'Tsy misy fangatahana',
    'passenger.howItWorks': 'Ahoana no fiasany ?',
    'passenger.step1': 'Karohy',
    'passenger.step2': 'Jereo',
    'passenger.step3': 'Miangavy',
    'passenger.selectCity': 'Misafidy tanàna...',
    'passenger.selectRouteFirst': 'Mila mikaroka lalana aloha',
    'passenger.selectDifferentCities': 'Misafidiana tanàna roa samy hafa',
    'passenger.ready': 'Vonona ny dianao manaraka eto Madagascar ?',
    'passenger.routeDetails': 'Anton\'ny dia',
    'passenger.date': 'Daty',
    
    // Dashboard Chauffeur
    'driver.myTrips': 'Diavako',
    'driver.schedule': 'Fandaharam-potoana',
    'driver.vehicle': 'Fiara',
    'driver.date': 'Daty',
    'driver.status': 'Toe-javatra',
    'driver.actions': 'Asa',
    'driver.start': 'Manomboka',
    'driver.finish': 'Mamarana',
    'driver.waitingRequests': 'Fangatahana miandry',
    'driver.passenger': 'Mpandeha',
    'driver.accept': 'Ekena',
    'driver.reject': 'Lavina',
    'driver.optimization': 'Fanatsarana Knapsack',
    'driver.selectVehicle': 'Fidio fiara',
    'driver.optimize': 'Manomboka fanatsarana',
    'driver.optimized': 'Toerana nohatsaraina',
    'driver.subtitle': 'Ahitàna ny dianao sy fanatsarana toerana',
    'driver.selectVehicleFirst': 'Fidio fiara aloha',
    'driver.noRequests': 'Tsy misy fangatahana miandry',
    'driver.noTrips': 'Tsy misy dia natokana ho anao',
    
    // Dashboard Coopérative
    'coop.planning': 'Fandaharana lalana',
    'coop.createTrip': 'Mamorona lalana',
    'coop.existingTrips': 'Lalana efa misy',
    'coop.traffic': 'Fitantanana fifamoivoizana',
    'coop.currentTraffic': 'Fifamoivoizana ankehitriny',
    'coop.newLevel': 'Ambaratonga vaovao',
    'coop.update': 'Havaozina',
    'coop.road': 'Lalana',
    'coop.from': 'Avy',
    'coop.to': 'Ho any',
    'coop.distance': 'Halavirana (km)',
    'coop.state': 'Toe-javatra',
    'coop.driverId': 'ID Mpamily',
    'coop.route': 'Lalana',
    
    // Dashboard Admin
    'admin.console': 'Birao lehibe',
    'admin.stats': 'Antontanisa',
    'admin.requests': 'Fangatahana',
    'admin.infrastructure': 'Fotodrafitrasa',
    'admin.logs': 'Firaketana',
    'admin.cities': 'Fitantanana tanàna',
    'admin.addCity': 'Manampy tanàna',
    'admin.cityName': 'Anaran-tanàna',
    'admin.latitude': 'Latitude',
    'admin.longitude': 'Longitude',
    'admin.routes': 'Fitantanana lalana',
    'admin.addRoute': 'Manampy lalana',
    'admin.open': 'Misokatra',
    'admin.degraded': 'Simba kely',
    'admin.bad': 'Mety simba',
    'admin.closed': 'Mihidy',
    'admin.noPendingRequests': 'Tsy misy fangatahana miandry',
    'admin.cityDeleted': 'Voafafa ny tanàna',
    'admin.routeDeleted': 'Voafafa ny lalana',
    'admin.cityAdded': 'Nampiana tanàna',
    'admin.routeAdded': 'Nampiana lalana',
    'admin.confirmDeleteCity': 'Mamoaka ity tanàna ity ?',
    'admin.confirmDeleteRoute': 'Mamoaka ity lalana ity ?',
    'admin.noLogs': 'Tsy misy firaketana',
    
    // Statuts
    'status.planned': 'Voalahatra',
    'status.inProgress': 'Mandeha',
    'status.completed': 'Vita',
    'status.accepted': 'Ekena',
    'status.waiting': 'Miandry',
    'status.refused': 'Lavina',
    
    // Messages
    'msg.loginSuccess': 'Nahomby ny fidirana !',
    'msg.logoutSuccess': 'Nahomby ny fivoahana !',
    'msg.registerSuccess': 'Nahomby ny fisoratana anarana !',
    'msg.requestSent': 'Nahomby ny fandefasana fangatahana !',
    'msg.requestAccepted': 'Ekena ny fangatahana !',
    'msg.requestRefused': 'Lavina ny fangatahana !',
    'msg.optimizationDone': 'Vita ny fanatsarana !',
    'msg.trafficUpdated': 'Nohavaozina ny fifamoivoizana !',
    'msg.planningCreated': 'Vita ny fandaharana lalana',
    
    // Logs
    'logs.performed': 'nanao',
    'logs.table': 'Latabatra',

    // Historique
    'history.tab': 'Tantara',

    // Ajouter dans l'objet mg:
'history.title': 'Tantara momba ny famandrihana',
'history.subtitle': 'Ahitàna sy fehezo ny fangatahanao rehetra eto amin\'ny toerana iray',
'history.total': 'Totaliny',
'history.route': 'Lalana',
'history.date': 'Daty nangatahana',
'history.searchPlaceholder': 'Karohy amin\'ny anaran-tanàna...',
'history.all': 'Rehetra',
'history.noReservations': 'Tsy misy famandrihana hita',
'history.noMatch': 'Tsy misy famandrihana mifanentana amin\'ny fikarohanao',
'history.noReservationsYet': 'Mbola tsy nanao famandrihana ianao',
'history.of': 'amin\'ny',
'history.id': 'ID',
'history.deleteConfirm': 'Vonona ny hamafa io famandrihana io ve ianao ? Tsy azo averina intsony io hetsika io.',
'msg.requestDeleted': 'Voafafa soa aman-tsara ny famandrihana',
'msg.sessionExpired': 'Lany ny fotoam-pidirana. Mila miditra indray ianao.',
'msg.noPermission': 'Tsy manana alalana hamafa ity famandrihana ity ianao.',
'msg.notFound': 'Tsy hita na efa voafafa ny famandrihana.',

// Landing Page - Navigation
'nav.home': 'Fandraisana',
'nav.benefits': 'Tombontsoa',
'nav.destinations': 'Toerana',
'nav.testimonials': 'Fijoroana',
'nav.contact': 'Ifandraisana',
'nav.login': 'Hiditra',
'nav.register': 'Hisoratra anarana',

// Landing Page - Hero
'hero.badge': 'Fitaterana Premium',
'hero.slide1.title': 'Mandehana manerana an\'i Madagasikara',
'hero.slide1.subtitle': 'Hahita ny hakanton\'ny Nosy be amin\'ny fiarovana',
'hero.slide2.title': 'Fitaterana azo itokisana sy ara-potoana',
'hero.slide2.subtitle': 'Fiaingana azo antoka ara-potoana ho an\'ny fiadananao',
'hero.slide3.title': 'Fanatsarana manan-tsaina',
'hero.slide3.subtitle': 'Ny algorithm-nay dia mahita ny lalana tsara indrindra ho anao',
'hero.slide4.title': 'Vidiny mirary',
'hero.slide4.subtitle': 'Vidiny mora ho an\'ny rehetra',
'hero.slide5.title': 'Fiarovana indrindra',
'hero.slide5.subtitle': 'Fiara voakarakara sy mpamily za-draharaha',
'hero.slide6.title': 'Tambajotra nasionaly',
'hero.slide6.subtitle': 'Mifandraisa amin\'ny faritra rehetra eto Madagasikara',
'hero.slide7.title': 'Fanampiana mpanjifa 24/7',
'hero.slide7.subtitle': 'Ekipa manokana hanampy anao isaky ny fotoana',
'hero.slide8.title': 'Rindranasa finday',
'hero.slide8.subtitle': 'Mandehana famandrihana sy manaraka ny dianao avy amin\'ny findainao',
'hero.start': 'Hanomboka',
'hero.login': 'Hiditra',

// Landing Page - Stats
'stats.passengers': 'Mpandeha entina',
'stats.cities': 'Tanàna aleha',
'stats.vehicles': 'Fiara azo',
'stats.satisfaction': 'Fahafaham-po',

// Landing Page - Features
'features.badge': 'Maninona no mifidy anay',
'features.title': 'Traikefa fitsangatsanganana miavaka',
'features.subtitle': 'Hahita ny tombony mahatonga an\'i ALPHA trans ho mpitarika ny fitaterana eto Madagasikara',
'features.guaranteed.title': 'Fiaingana azo antoka',
'features.guaranteed.description': 'Fandaharam-potoana azo itokisana sy fiaingana isan\'andro',
'features.security.title': 'Fiarovana tanteraka',
'features.security.description': 'Fiara voakarakara sy mpamily za-draharaha',
'features.optimization.title': 'Fanatsarana manan-tsaina',
'features.optimization.description': 'Algorithm ho an\'ny lalana tsara indrindra',
'features.booking.title': 'Famandrihana mora',
'features.booking.description': 'Mandehana famandrihana amin\'ny fikitoantoana vitsy',

// Landing Page - Destinations
'destinations.badge': 'Toerana',
'destinations.title': 'Ireo lalana malaza indrindra',
'destinations.subtitle': 'Hamakivaky ny lalana tsara indrindra eto Madagasikara',

// Landing Page - Testimonials
'testimonials.badge': 'Fijoroana',
'testimonials.title': 'Izao no lazain\'ny mpanjifanay',
'testimonials.subtitle': 'Natoky taminay izy ireo ary nizara ny traikefany',
'testimonials.content1': 'Fanompoana miavaka ! Dia ara-potoana sy mpamily tena mahay.',
'testimonials.content2': 'Nahita an\'i Madagasikara tamin\'ny ALPHA trans aho. Traikefa tsy hay hadinoina !',
'testimonials.content3': 'Fiaraha-miasa tsara, fitantanana toerana nohatsaraina ary fitomboan\'ny vola miditra.',
'testimonials.role1': 'Mpandeha tsy tapaka',
'testimonials.role2': 'Mpizaha tany',
'testimonials.role3': 'Kooperativa',

// Landing Page - CTA
'cta.title': 'Vonona ny handeha miaraka amin\'ny ALPHA trans ?',
'cta.subtitle': 'Manatevin-daharana an\'ireo mpandeha an\'arivony izay matoky anay isan\'andro',
'cta.createAccount': 'Hamorona kaonty',
'cta.alreadyRegistered': 'Efa misoratra anarana ? Hiditra',

// Landing Page - Footer
'footer.description': 'Ny sehatra revolisionera hanatsarana ny dianao amin\'ny taxi-brousse eto Madagasikara.',
'footer.quickLinks': 'Rohy haingana',
'footer.support': 'Fanampiana',
'footer.helpCenter': 'Foibem-panampiana',
'footer.faq': 'FAQ',
'footer.terms': 'Fepetra aman-dalàna',
'footer.privacy': 'Politikan\'ny tsiambaratelo',
'footer.contact': 'Fifandraisana',
'footer.address': 'Antananarivo, Madagasikara',
'footer.copyright': '© 2026 ALPHA trans. Zo rehetra voatokana. | Vita tamin\'ny fitiavana eto Madagasikara',

// Logout confirmation
'logout.title': 'Fivoahana',
'logout.confirm': 'Vonona ny hivoaka ve ianao ?',
'logout.confirmButton': 'Hivoaka',
  },
};

// ==================== PROVIDER ====================

export const LanguageProvider = ({ children }) => {
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('language');
    if (saved === 'fr' || saved === 'mg') return saved;
    return 'fr';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  
  // Fonction de traduction
  const t = (key) => {
    const translation = translations[language]?.[key];
    if (!translation) {
      // Retourner la clé elle-même si la traduction n'existe pas
      console.warn(`[Traduction manquante] ${key} pour la langue ${language}`);
      return key;
    }
    return translation;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.setAttribute('data-lang', language);
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'fr' || lang === 'mg') {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    t,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};