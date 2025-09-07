import { timestamp } from "drizzle-orm/pg-core";

const timestampTableColumns = {
  updated_at: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  created_at: timestamp().defaultNow().notNull(),
};

export default timestampTableColumns;
