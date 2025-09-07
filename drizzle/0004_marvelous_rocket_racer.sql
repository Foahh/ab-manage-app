ALTER TABLE "songer" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."songer_role";--> statement-breakpoint
CREATE TYPE "public"."songer_role" AS ENUM('real', 'fake_assigned', 'fake_random');--> statement-breakpoint
ALTER TABLE "songer" ALTER COLUMN "role" SET DATA TYPE "public"."songer_role" USING "role"::"public"."songer_role";--> statement-breakpoint
ALTER TABLE "songer" DROP COLUMN "isRandomAssigned";