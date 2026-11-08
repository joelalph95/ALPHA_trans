const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // WAMP root password par défaut
    database: 'smarttransport',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Database access was denied.');
        }
    }
    if (connection) {
        connection.release();
        console.log(' Connecté à la base de données MySQL');
    }
});

module.exports = pool.promise();
