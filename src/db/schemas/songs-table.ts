import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import type { SongMetadata } from "@/lib/arcaea/song-schema";

export const songsTable = sqliteTable("songs", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  metadata: text("metadata", { mode: "json" }).$type<SongMetadata>().notNull(),
  isBonus: integer("isBonus", { mode: "boolean" }).notNull().default(false),
  mysteryOrder: integer("mysteryOrder").notNull().default(0),
  usingCustomDesigners: integer("usingCustomDesigners", { mode: "boolean" }).notNull().default(false),
  ...timestampTableColumns,
});
