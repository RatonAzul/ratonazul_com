CREATE TABLE "game_preference" (
	"user_id" text NOT NULL,
	"game" text NOT NULL,
	CONSTRAINT "game_preference_user_id_game_pk" PRIMARY KEY("user_id","game"),
	CONSTRAINT "game_preference_known_game" CHECK ("game_preference"."game" in ('wordle', 'la-palabra-del-dia', 'isaaconnect'))
);
--> statement-breakpoint
ALTER TABLE "game_preference" ADD CONSTRAINT "game_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;