import { sql, relations } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, timestamp, char, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";



const default_field = {
  create_date: timestamp("create_date").defaultNow().notNull(),
  write_date: timestamp("write_date").notNull().defaultNow().$onUpdate(() => new Date()),
  create_uid: integer("create_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
  write_uid: integer("write_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
};



export const models = pgTable("ir_model", {
    id: serial("id").primaryKey(),
    model: varchar("model"),
    description: varchar("name"),
    type : varchar("state"),
    ...default_field
});


export const models_relation = relations(models, ({ many, one }) => ({
    fields: many(fields),
    createdBy: one(users, {
        fields: [models.create_uid],
        references: [users.id]
    }),
    updatedBy: one(users, {
        fields: [models.write_uid],
        references: [users.id]
    })
}));


enum FieldType {
    binary = 'binary',
    char = 'char',
    boolean = 'boolean'
}
function enumToPgEnum<T extends Record<string, any>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
    return Object.values(myEnum).map((value: any) => `${value}`) as any
}
const xStudioFieldStatus = pgEnum("ttype", enumToPgEnum(FieldType));


export const fields = pgTable("ir_model_fields", {
    id: serial("id").primaryKey(),
    name: char("name"),
    label: varchar("field_description"),
    model_id : integer("model_id").references(() => models.id, { onDelete: "set null" }).default(sql`NULL`),
    type : xStudioFieldStatus("ttype"),
    ...default_field
});


export const fields_relation = relations(fields, ({ one, many }) => ({
    models: one( models, {
        fields: [fields.model_id],
        references: [models.id]
    }),
    createdBy: one(users, {
        fields: [fields.create_uid],
        references: [users.id]
    }),
    updatedBy: one(users, {
        fields: [fields.write_uid],
        references: [users.id]
    }),
}));


