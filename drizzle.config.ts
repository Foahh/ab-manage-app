import { defineConfig } from "drizzle-kit";
import { dbFile } from "@/lib/data";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbFile}`,
  },
});
