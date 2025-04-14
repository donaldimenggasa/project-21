import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

import * as users from './schema/users';
import * as unit_amc from './schema/unit_amc';
import * as yori_builder from './schema/yori_builder';
import * as datasource from './schema/datasource';



const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.BUILDER_DATABASE_URL,
});
export const db = drizzle({ 
    client: pool,
    schema: { 
        ...users,
        ...unit_amc,
        ...yori_builder,
        ...datasource,
    }
});

