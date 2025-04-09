import knex from 'knex';

const db = knex({
  client: process.env.MAIN_DB_CLIENT,
  connection: {
    host: process.env.MAIN_DB_HOST,
    user: process.env.MAIN_DB_USERNAME,
    password: process.env.MAIN_DB_PASSWORD,
    database: process.env.MAIN_DB_DATABASE
  }
});

export default db