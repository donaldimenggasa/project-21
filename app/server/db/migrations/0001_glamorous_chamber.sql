CREATE TABLE "x_studio_operator" (
	"id" serial PRIMARY KEY NOT NULL,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD COLUMN "x_studio_operator" integer DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "x_studio_operator" ADD CONSTRAINT "x_studio_operator_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_studio_operator" ADD CONSTRAINT "x_studio_operator_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD CONSTRAINT "x_data_amc_x_studio_operator_x_studio_operator_id_fk" FOREIGN KEY ("x_studio_operator") REFERENCES "public"."x_studio_operator"("id") ON DELETE set null ON UPDATE no action;