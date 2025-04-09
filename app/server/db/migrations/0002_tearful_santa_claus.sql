CREATE TABLE "x_data_airport" (
	"id" serial PRIMARY KEY NOT NULL,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD COLUMN "x_studio_from" integer DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD COLUMN "x_studio_destination" integer DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "x_data_airport" ADD CONSTRAINT "x_data_airport_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_data_airport" ADD CONSTRAINT "x_data_airport_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD CONSTRAINT "x_data_amc_x_studio_from_x_data_airport_id_fk" FOREIGN KEY ("x_studio_from") REFERENCES "public"."x_data_airport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD CONSTRAINT "x_data_amc_x_studio_destination_x_data_airport_id_fk" FOREIGN KEY ("x_studio_destination") REFERENCES "public"."x_data_airport"("id") ON DELETE set null ON UPDATE no action;