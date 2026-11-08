const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trajets', require('./routes/trajets'));
app.use('/api/optimisation', require('./routes/optimisation'));
app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
