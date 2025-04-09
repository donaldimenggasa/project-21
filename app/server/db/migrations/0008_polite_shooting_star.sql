CREATE TABLE "x_projects_line_e076e" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_projects_id" integer DEFAULT NULL,
	"x_name" jsonb,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "x_projects_line_e076e" ADD CONSTRAINT "x_projects_line_e076e_x_projects_id_x_projects_id_fk" FOREIGN KEY ("x_projects_id") REFERENCES "public"."x_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_projects_line_e076e" ADD CONSTRAINT "x_projects_line_e076e_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_projects_line_e076e" ADD CONSTRAINT "x_projects_line_e076e_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;