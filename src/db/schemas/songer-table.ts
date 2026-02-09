import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { SongerRoles } from "@/actions/schemas/songer-action-schema";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import { songsTable } from "@/db/schemas/songs-table";
import { usersTable } from "@/db/schemas/users-table";

export const SongerRoleEnum = () => text("songer_role", { enum: SongerRoles });

export const songerTable = sqliteTable(
  "songer",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    role: SongerRoleEnum().notNull(),

    ...timestampTableColumns,
  },
  (table) => [primaryKey({ columns: [table.songId, table.userId] })],
);
