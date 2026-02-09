import { mkdirSync, existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { dbFile, dataDir } from "@/lib/data";

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const client = new Database(dbFile, { create: true });
export const db = drizzle({ client });
