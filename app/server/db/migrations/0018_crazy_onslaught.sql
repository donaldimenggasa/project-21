CREATE TABLE "ir_ui_menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" char,
	"parent_id" integer,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "ir_ui_menu" ADD CONSTRAINT "ir_ui_menu_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ir_ui_menu" ADD CONSTRAINT "ir_ui_menu_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;