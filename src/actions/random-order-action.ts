"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songsTable } from "@/db/schemas/songs-table";
import { shuffle } from "@/lib/shuffle";

export async function randomMysteryOrder() {
  const songs = await db.select().from(songsTable);
  const shuffled = shuffle(songs);
  for (let i = 0; i < shuffled.length; i++) {
    await db
      .update(songsTable)
      .set({ mysteryOrder: i + 1 })
      .where(eq(songsTable.id, shuffled[i].id));
  }
}
