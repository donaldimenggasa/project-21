CREATE TABLE "x_data_amc" (
	"id" serial PRIMARY KEY NOT NULL,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "res_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" text NOT NULL,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "res_users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD CONSTRAINT "x_data_amc_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "x_data_amc" ADD CONSTRAINT "x_data_amc_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;