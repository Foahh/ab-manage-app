CREATE TABLE "songs"
(
    "id"         integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "songs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "metadata"   json                    NOT NULL,
    "ownerId"    integer,
    "option0"    integer,
    "option1"    integer,
    "option2"    integer,
    "option3"    integer,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"
(
    "id"         integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "name"       varchar                 NOT NULL,
    "email"      varchar,
    "qq"         varchar,
    "bilibili"   varchar,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "songs"
    ADD CONSTRAINT "songs_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs"
    ADD CONSTRAINT "songs_option0_users_id_fk" FOREIGN KEY ("option0") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs"
    ADD CONSTRAINT "songs_option1_users_id_fk" FOREIGN KEY ("option1") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs"
    ADD CONSTRAINT "songs_option2_users_id_fk" FOREIGN KEY ("option2") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs"
    ADD CONSTRAINT "songs_option3_users_id_fk" FOREIGN KEY ("option3") REFERENCES "public"."users" ("id") ON DELETE set null ON UPDATE no action;