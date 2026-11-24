CREATE TABLE "notification_group_mute" (
	"user_id" text NOT NULL,
	"group_name" "notification_group" NOT NULL,
	CONSTRAINT "notification_group_mute_user_id_group_name_pk" PRIMARY KEY("user_id","group_name")
);
--> statement-breakpoint
ALTER TABLE "notification_group_mute" ADD CONSTRAINT "notification_group_mute_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;