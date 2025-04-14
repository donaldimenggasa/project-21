import { sql, relations } from "drizzle-orm";
import { pgTable, serial, text, varchar, integer, timestamp, char, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";



const default_field = {
  create_date: timestamp("create_date").defaultNow().notNull(),
  write_date: timestamp("write_date").notNull().defaultNow().$onUpdate(() => new Date()),
  create_uid: integer("create_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
  write_uid: integer("write_uid").references(() => users.id, { onDelete: "set null" }).default(sql`NULL`),
};


//=========== PROJECT GROUPS
export const project_groups = pgTable("x_project_groups", {
  id: serial("id").primaryKey(),
  x_name: jsonb("x_name"),
  ...default_field,
});

export const project_groups_relation = relations(project_groups, ({ many, one }) => ({
    projects: many(projects,),
    createdBy: one(users, {
        fields: [project_groups.create_uid],
        references: [users.id],
    }),
    updatedBy: one(users, {
        fields: [project_groups.write_uid],
        references: [users.id]
    })
}));






//=========== PROJECT PAGES
export const project_pages = pgTable("x_projects_line_75ab2", {
    id: serial("id").primaryKey(),
    x_projects_id : integer("x_projects_id").references(() => projects.id, { onDelete: "set null" }).default(sql`NULL`),
    x_name: jsonb("x_name"),
    prod_state : jsonb("x_studio_prod_snapshot"),
    state: jsonb("x_studio_state"),
    ...default_field
});

export const project_pages_relation = relations(project_pages, ({ one, many }) => ({
    project: one( projects, {
        fields: [project_pages.x_projects_id],
        references: [projects.id]
    }),
    createdBy: one(users, {
        fields: [project_pages.create_uid],
        references: [users.id]
    }),
    updatedBy: one(users, {
        fields: [project_pages.write_uid],
        references: [users.id]
    }),
}));


//=========== PROJECT USERS
export const project_users = pgTable("x_projects_line_e076e", {
    id: serial("id").primaryKey(),
    x_projects_id : integer("x_projects_id").references(() => projects.id, { onDelete: "set null" }).default(sql`NULL`),
    x_name: jsonb("x_name"),
    ...default_field
});
export const project_users_relation = relations(project_users, ({ one, many }) => ({
    project: one( projects, {
        fields: [project_users.x_projects_id],
        references: [projects.id]
    }),
    createdBy: one(users, {
        fields: [project_users.create_uid],
        references: [users.id]
    }),
    updatedBy: one(users, {
        fields: [project_users.write_uid],
        references: [users.id]
    }),
}));






//=========== PROJECT 

/*
export const project_index_page = pgTable("x_projects_line_75ab2", {
    id: serial("id").primaryKey(),
    x_name: jsonb("x_name"),
    state: jsonb("x_studio_state"),
    ...default_field
});
*/

export enum ProjectStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
  }
  
  export function enumToPgEnum<T extends Record<string, any>>(
    myEnum: T,
  ): [T[keyof T], ...T[keyof T][]] {
    return Object.values(myEnum).map((value: any) => `${value}`) as any
  }

const xStudioStatusEnum = pgEnum("x_studio_status", enumToPgEnum(ProjectStatus));

export const projects = pgTable("x_projects", {
    id: serial("id").primaryKey(),
    x_name: jsonb("x_name"),
    x_active: boolean("x_active").default(true),
    x_studio_group: integer("x_studio_group").references(() => project_groups.id, { onDelete: "set null" }).default(sql`NULL`),
    x_studio_index_page : integer("x_studio_index_page"),
    pathname: varchar("x_studio_pathname"),
    description: varchar("x_studio_descriptions_1"),
    description_2: varchar("x_studio_descriptions_2"),
    x_studio_status: xStudioStatusEnum("x_studio_status"),
    ...default_field
});


export const projects_relation = relations(projects, ({ one, many }) => ({
    index_page: one(project_pages, {
        fields: [projects.x_studio_index_page],
        references: [project_pages.id]
    }),
    pages: many(project_pages),
    users: many(project_users),
    group: one(project_groups, {
        fields: [projects.x_studio_group],
        references: [project_groups.id]
    }),
    createdBy: one(users, {
        fields: [projects.create_uid],
        references: [users.id]
    }),
    updatedBy: one(users, {
        fields: [projects.write_uid],
        references: [users.id]
    }),
}));





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

export const fields = pgTable("ir_model_fields", {
    id: serial("id").primaryKey(),
    name: char("name"),
    label: varchar("field_description"),
    ...default_field
});



export const menus = pgTable("ir_ui_menu", {
    id: serial("id").primaryKey(),
    name: char("name"),
    parent_id: integer("parent_id").default(sql`NULL`),
    sequence: integer("sequence").default(10),
    action : char("action"),
    ...default_field
});


export const actWindow  = pgTable("ir_act_window", {
    id: serial("id").primaryKey(),
    name: char("name"),
   
    res_model: char("res_model"),
    views: char("res_model"),
    ...default_field
});

export const uiView  = pgTable("ir_ui_view", {
    id: serial("id").primaryKey(),
    name: char("name"),
    type: char("type"),
    model: char("model"),
    ...default_field
});






