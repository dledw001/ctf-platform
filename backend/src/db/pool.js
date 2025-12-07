const { Pool } = require('pg');

console.log('NODE_ENV in pool:', process.env.NODE_ENV);
console.log('DATABASE_URL in pool:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;