import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config";

export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: true,
  },
});
