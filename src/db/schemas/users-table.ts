import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import timestampTableColumns from "@/db/schemas/columns/timestamp-column";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  name: varchar().notNull(),
  isJammer: boolean().notNull().default(false),

  contact: varchar(),
  bilibili: varchar(),

  ...timestampTableColumns,
});
