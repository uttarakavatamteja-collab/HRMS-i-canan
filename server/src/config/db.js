const knex = require('knex');
const knexConfig = require('../../knexfile');

const environment = (process.env.NODE_ENV || 'development').trim().toLowerCase();
const config = knexConfig[environment];
if (!config) {
  console.error(`ERROR: database config not found for environment: "${environment}"`);
}
const db = knex(config);

module.exports = db;
