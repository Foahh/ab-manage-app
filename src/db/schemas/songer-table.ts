import { integer, pgEnum, pgTable, primaryKey } from "drizzle-orm/pg-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import { songsTable } from "@/db/schemas/songs-table";
import { usersTable } from "@/db/schemas/users-table";
import { SongerRoles } from "@/actions/schemas/songer-action-schema";

export const SongerRoleEnum = pgEnum("songer_role", SongerRoles);

export const songerTable = pgTable(
  "songer",
  {
    songId: integer()
      .notNull()
      .references(() => songsTable.id, { onDelete: "cascade" }),
    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    role: SongerRoleEnum().notNull(),

    ...timestampTableColumns,
  },
  (table) => [primaryKey({ columns: [table.songId, table.userId] })],
);
