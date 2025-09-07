CREATE TYPE "public"."songer_role" AS ENUM('real', 'fake');--> statement-breakpoint
CREATE TABLE "songer" (
	"songId" integer NOT NULL,
	"userId" integer NOT NULL,
	"role" "songer_role" NOT NULL,
	CONSTRAINT "songer_songId_userId_pk" PRIMARY KEY("songId","userId")
);
--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_ownerId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_option0_users_id_fk";
--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_option1_users_id_fk";
--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_option2_users_id_fk";
--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_option3_users_id_fk";
--> statement-breakpoint
ALTER TABLE "songer" ADD CONSTRAINT "songer_songId_songs_id_fk" FOREIGN KEY ("songId") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songer" ADD CONSTRAINT "songer_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "ownerId";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "option0";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "option1";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "option2";--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "option3";