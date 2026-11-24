CREATE TABLE "notification_preference" (
	"user_id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"last_seen_id" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_notification_preference_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."notification_preference"("user_id") ON DELETE cascade ON UPDATE no action;