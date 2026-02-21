import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";
import { songsTable } from "@/db/schemas/songs-table";
import { CustomDesignerRoles } from "@/actions/schemas/custom-designer-action-schema";

export const CustomDesignerRoleEnum = () =>
  text("role", { enum: CustomDesignerRoles });

export const customDesignerTable = sqliteTable(
  "custom_designer",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    songId: integer("song_id")
      .notNull()
      .references(() => songsTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    role: CustomDesignerRoleEnum().notNull(),
    ...timestampTableColumns,
  },
);
