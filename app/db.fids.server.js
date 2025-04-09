import knex from 'knex';

const db = knex({
  client: process.env.DATABASE_CLIENT_FIDS,
  connection: {
    host: process.env.DATABASE_HOST_FIDS,
    user: process.env.DATABASE_USERNAME_FIDS,
    password: process.env.DATABASE_PASSWORD_FIDS,
    database: process.env.DATABASE_NAME_FIDS
  }
});

export default db