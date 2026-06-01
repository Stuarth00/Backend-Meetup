require('dotenv').config();
const initialOptions = {};
const pgp = require('pg-promise')(initialOptions);

const cn = {
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
}

const db = pgp(cn)

module.exports = db;