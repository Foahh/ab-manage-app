import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { DesignerRoles } from "@/actions/schemas/designer-action-schema";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import { songsTable } from "@/db/schemas/songs-table";
import { usersTable } from "@/db/schemas/users-table";

// backward compability
export const DesignerRoleEnum = () =>
  text("songer_role", { enum: DesignerRoles });

export const designerTable = sqliteTable(
  "songer",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    role: DesignerRoleEnum().notNull(),

    ...timestampTableColumns,
  },
  (table) => [primaryKey({ columns: [table.songId, table.userId] })],
);
