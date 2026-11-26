CREATE TABLE "game_players" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"first_user_id" text,
	"second_user_id" text,
	CONSTRAINT "game_players_single_pair" CHECK ("game_players"."id" = 1),
	CONSTRAINT "game_players_distinct_users" CHECK ("game_players"."first_user_id" <> "game_players"."second_user_id")
);
--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_first_user_id_user_id_fk" FOREIGN KEY ("first_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_second_user_id_user_id_fk" FOREIGN KEY ("second_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;