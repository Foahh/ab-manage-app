import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { dataDir, dbFile } from "@/lib/data";

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const client = new Database(dbFile, { create: true });
export const db = drizzle({ client });
