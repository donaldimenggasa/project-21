import knex from 'knex';

const db = knex({
  client: process.env.RETOOL_DB_CLIENT,
  connection: {
    host: process.env.RETOOL_HOST,
    user: process.env.RETOOL_DB_USERNAME,
    password: process.env.RETOOL_DB_PASSWORD,
    database: process.env.RETOOL_DB_NAME,
    port : process.env.RETOOL_DB_PORT
  }
});

export default db