import knex from 'knex';

const db = knex({
  client: process.env.DATABASE_CLIENT_ODOO,
  connection: {
    host: process.env.DATABASE_HOST_ODOO,
    user: process.env.DATABASE_USERNAME_ODOO,
    password: process.env.DATABASE_PASSWORD_ODOO,
    database: process.env.DATABASE_NAME_ODOO,
    port : process.env.DATABASE_PORT_ODOO
  }
});

export default db