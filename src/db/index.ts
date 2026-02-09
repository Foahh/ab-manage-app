import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { dbFile } from "@/lib/data";
import fs from "node:fs/promises";


const client = new Database(dbFile, { create: true });
export const db = drizzle({ client });
