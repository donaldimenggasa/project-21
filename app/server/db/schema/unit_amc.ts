import { sql, relations } from 'drizzle-orm';
import { pgTable, serial, text, varchar, integer, timestamp, char  } from "drizzle-orm/pg-core";
import { users } from './users';

const default_field = {
  create_date: timestamp("create_date").defaultNow().notNull(),
  write_date: timestamp("write_date").notNull().defaultNow().$onUpdate(() => new Date()),
  create_uid: integer("create_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
  write_uid: integer("write_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
}


export const airport = pgTable("x_data_airport", {
  id: serial("id").primaryKey(),
  ...default_field
});


export const airlines = pgTable("x_studio_operator", {
  id: serial("id").primaryKey(),
  ...default_field
});


export const data_amc = pgTable("x_data_amc", {
  id: serial("id").primaryKey(),
  x_studio_operator: integer("x_studio_operator").references(() => airlines.id, { onDelete: "set null" }).default(sql`NULL`),
  x_studio_from: integer("x_studio_from").references(() => airport.id, { onDelete: "set null" }).default(sql`NULL`),
  x_studio_destination: integer("x_studio_destination").references(() => airport.id, { onDelete: "set null" }).default(sql`NULL`),
  ...default_field
});



export const data_amc_relation = relations(data_amc, ({ one }) => ({
  airlines: one(airlines, {
		fields: [data_amc.x_studio_operator],
		references: [airlines.id],
	}),
  from: one(airport, {
		fields: [data_amc.x_studio_from],
		references: [airport.id],
	}),
  destination: one(airport, {
		fields: [data_amc.x_studio_destination],
		references: [airport.id],
	}),
	createdBy: one(users, {
		fields: [data_amc.create_uid],
		references: [users.id],
	}),
  updatedBy: one(users, {
		fields: [data_amc.write_uid],
		references: [users.id],
	}),
}));