import { boolean, integer, json, pgTable } from "drizzle-orm/pg-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import type { SongMetadata } from "@/lib/arcaea/song-schema";

export const songsTable = pgTable("songs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  metadata: json().$type<SongMetadata>().notNull(),
  isBonus: boolean().notNull().default(false),
  mysteryOrder: integer().notNull().default(0),
  ...timestampTableColumns,
});
