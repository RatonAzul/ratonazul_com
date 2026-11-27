CREATE TABLE "game_opponent" (
	"user_id" text PRIMARY KEY NOT NULL,
	"opponent_id" text NOT NULL,
	CONSTRAINT "game_opponent_distinct_users" CHECK ("game_opponent"."user_id" <> "game_opponent"."opponent_id")
);
--> statement-breakpoint
ALTER TABLE "game_opponent" ADD CONSTRAINT "game_opponent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_opponent" ADD CONSTRAINT "game_opponent_opponent_id_user_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "game_opponent" ("user_id", "opponent_id")
SELECT "first_user_id", "second_user_id"
FROM "game_players"
WHERE "first_user_id" IS NOT NULL AND "second_user_id" IS NOT NULL
UNION ALL
SELECT "second_user_id", "first_user_id"
FROM "game_players"
WHERE "first_user_id" IS NOT NULL AND "second_user_id" IS NOT NULL;
