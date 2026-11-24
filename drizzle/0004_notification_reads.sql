CREATE TABLE "notification_read" (
	"user_id" text NOT NULL,
	"notification_id" integer NOT NULL,
	CONSTRAINT "notification_read_user_id_notification_id_pk" PRIMARY KEY("user_id","notification_id")
);
--> statement-breakpoint
ALTER TABLE "notification_read" ADD CONSTRAINT "notification_read_user_id_notification_preference_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."notification_preference"("user_id") ON DELETE cascade ON UPDATE no action;