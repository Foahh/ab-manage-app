import { integer } from "drizzle-orm/sqlite-core";

const timestampTableColumns = {
  updated_at: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
  created_at: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
};

export default timestampTableColumns;
