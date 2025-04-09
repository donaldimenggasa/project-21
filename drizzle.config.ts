import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.BUILDER_DATABASE_URL) {
  throw new Error("Missing environment variable: BUILDER_DATABASE_URL");
}

export default defineConfig({
  out: "./app/server/db/migrations", // Folder output migration
  schema: "./app/server/db/schema/*", // File schema Drizzledb/schema", 
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.BUILDER_DATABASE_URL,
  },
});
