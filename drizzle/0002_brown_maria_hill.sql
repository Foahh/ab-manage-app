ALTER TABLE "songer" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "songer" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;