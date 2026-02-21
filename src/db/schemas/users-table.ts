import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  isJammer: integer("isJammer", { mode: "boolean" }).default(false),

  contact: text("contact"),
  bilibili: text("bilibili"),

  ...timestampTableColumns,
});
