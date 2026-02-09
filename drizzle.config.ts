import { dbFile } from "@/lib/data";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbFile}`,
  },
});
