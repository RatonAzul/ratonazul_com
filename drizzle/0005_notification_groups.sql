CREATE TYPE "public"."notification_group" AS ENUM('games', 'calendar', 'motorsport', 'admin');--> statement-breakpoint
CREATE TABLE "notification_group_member" (
	"user_id" text NOT NULL,
	"group_name" "notification_group" NOT NULL,
	CONSTRAINT "notification_group_member_user_id_group_name_pk" PRIMARY KEY("user_id","group_name")
);
--> statement-breakpoint
ALTER TABLE "notification_group_member" ADD CONSTRAINT "notification_group_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;