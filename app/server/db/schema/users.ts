
import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("res_users", {
  id: serial("id").primaryKey(),
  email: text("login").notNull().unique(),
  create_date: timestamp("create_date").defaultNow().notNull(),
  write_date: timestamp("write_date").notNull().defaultNow().$onUpdate(() => new Date()),
});

