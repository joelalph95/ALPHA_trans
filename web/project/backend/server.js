const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // <-- importer le pool MySQL

// Import des routes
const authRoutes = require('./routes/auth');
const villesRoutes = require('./routes/villes');
const routesRoutes = require('./routes/routes');
const itineraryRoutes = require('./routes/itinerary');
const demandesRoutes = require('./routes/demandes');
const reservationsRoutes = require('./routes/reservations');
const vehiclesRoutes = require('./routes/vehicles');
const planningsRoutes = require('./routes/plannings');
const trafficRoutes = require('./routes/traffic');
const logsRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/villes', villesRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/demandes', demandesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/vehicules', vehiclesRoutes);
app.use('/api/plannings', planningsRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/logs', logsRoutes);

// Route de test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'SmartTransport 2035 API is running' });
});

// Fonction de test de connexion MySQL
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(' Connexion à MySQL réussie.');
    connection.release();
    return true;
  } catch (error) {
    console.error(' Échec de connexion à MySQL :', error.message);
    return false;
  }
}

// Démarrage du serveur après vérification de la base
testDbConnection().then((isConnected) => {
  if (isConnected) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Serveur démarré sur http://10.104.62.163:${PORT}`);
    });
  } else {
    console.error('Le serveur n\'a pas pu démarrer car la base de données est inaccessible.');
    process.exit(1); // arrête le processus si la DB n'est pas disponible
  }
});