ALTER TABLE "songs" RENAME COLUMN "bonus" TO "isBonus";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isJammer" boolean DEFAULT false NOT NULL;