CREATE TABLE "x_project_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "x_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_name" varchar,
	"x_studio_group" integer DEFAULT NULL,
	"x_studio_pathname" varchar,
	"x_studio_descriptions_1" varchar,
	"x_studio_descriptions_2" varchar,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "x_project_groups" ADD CONSTRAINT "x_project_groups_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_project_groups" ADD CONSTRAINT "x_project_groups_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_projects" ADD CONSTRAINT "x_projects_x_studio_group_x_project_groups_id_fk" FOREIGN KEY ("x_studio_group") REFERENCES "public"."x_project_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_projects" ADD CONSTRAINT "x_projects_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_projects" ADD CONSTRAINT "x_projects_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;