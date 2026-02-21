"use server";

import { desc, eq } from "drizzle-orm";
import { IdSchema } from "@/actions/schemas/common-action-schema";
import {
  SongBulkImportSchema,
  SongCreateSchema,
  SongUpdateSchema,
} from "@/actions/schemas/song-action-schema";
import { db } from "@/db";
import { songsTable } from "@/db/schemas/songs-table";

export async function getAllSongs() {
  return db.select().from(songsTable);
}

export type Song = Awaited<ReturnType<typeof getAllSongs>>[number];

export async function addSong(dirt: unknown) {
  const data = SongCreateSchema.parse(dirt);
  const [user] = await db.insert(songsTable).values(data).returning();

  return user;
}

export async function bulkImportSongs(dirt: unknown) {
  const data = SongBulkImportSchema.parse(dirt).songs.map((song) => ({
    metadata: song,
    isBonus: false,
    mysteryOrder: 0,
  }));

  const songs = await db.insert(songsTable).values(data).returning();
  return songs;
}

export async function editSong(songId: number, dirt: unknown) {
  songId = IdSchema.parse(songId);
  const data = SongUpdateSchema.parse(dirt);

  const [user] = await db
    .update(songsTable)
    .set(data)
    .where(eq(songsTable.id, songId))
    .returning();

  return user;
}

export async function deleteSong(songId: number) {
  songId = IdSchema.parse(songId);

  await db.delete(songsTable).where(eq(songsTable.id, songId));

  return { success: true };
}

export async function getNextMysteryOrder() {
  const result = await db
    .select()
    .from(songsTable)
    .orderBy(desc(songsTable.mysteryOrder))
    .limit(1);

  return (result[0]?.mysteryOrder || 0) + 1;
}
