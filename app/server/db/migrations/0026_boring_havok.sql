CREATE TABLE "ir_act_window" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" char,
	"parent_id" char,
	"res_model" char,
	"create_date" timestamp DEFAULT now() NOT NULL,
	"write_date" timestamp DEFAULT now() NOT NULL,
	"create_uid" integer DEFAULT NULL,
	"write_uid" integer DEFAULT NULL
);
--> statement-breakpoint
DROP TABLE "ir_actions_actWindow" CASCADE;--> statement-breakpoint
ALTER TABLE "ir_act_window" ADD CONSTRAINT "ir_act_window_create_uid_res_users_id_fk" FOREIGN KEY ("create_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ir_act_window" ADD CONSTRAINT "ir_act_window_write_uid_res_users_id_fk" FOREIGN KEY ("write_uid") REFERENCES "public"."res_users"("id") ON DELETE set null ON UPDATE no action;