"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { songerTable } from "@/db/schemas/songer-table";
import { IdSchema } from "@/actions/schemas/common-action-schema";
import {
  MultipleSongersSchema,
  SongerCreateSchema,
  SongerUpdateSchema,
} from "@/actions/schemas/songer-action-schema";

export async function getAllSongers() {
  return db.select().from(songerTable);
}

export async function getSomeSongers(songId: number) {
  return db
    .select()
    .from(songerTable)
    .where(eq(songerTable.songId, IdSchema.parse(songId)));
}

export type Songer = Awaited<ReturnType<typeof getAllSongers>>[number];

export async function addSonger(dirt: unknown) {
  const data = SongerCreateSchema.parse(dirt);
  const [user] = await db.insert(songerTable).values(data).returning();

  return user;
}

export async function editSonger(
  songId: number,
  userId: number,
  dirt: unknown,
) {
  const data = SongerUpdateSchema.parse(dirt);

  const [user] = await db
    .update(songerTable)
    .set(data)
    .where(
      and(
        eq(songerTable.songId, IdSchema.parse(songId)),
        eq(songerTable.userId, IdSchema.parse(userId)),
      ),
    )
    .returning();

  return user;
}

export async function deleteSonger(songId: number, userId: number) {
  await db
    .delete(songerTable)
    .where(
      and(
        eq(songerTable.songId, IdSchema.parse(songId)),
        eq(songerTable.userId, IdSchema.parse(userId)),
      ),
    );

  return { success: true };
}

export async function updateMultipleSongers(dirt: unknown) {
  const data = MultipleSongersSchema.parse(dirt);
  if (!data.songId) {
    throw new Error("Song ID is required");
  }

  const existingSongers = await getSomeSongers(data.songId);
  const existingUserIds = new Set(existingSongers.map((s) => s.userId));
  const newUserIds = new Set(data.songers.map((s) => s.userId));

  const usersToDelete = existingSongers.filter(
    (s) => !newUserIds.has(s.userId),
  );
  for (const songer of usersToDelete) {
    await deleteSonger(data.songId, songer.userId);
  }

  for (const songerData of data.songers) {
    if (!songerData.userId) {
      continue;
    }

    if (existingUserIds.has(songerData.userId)) {
      await editSonger(data.songId, songerData.userId, {
        role: songerData.role,
      });
    } else {
      await addSonger({
        songId: data.songId,
        userId: songerData.userId,
        role: songerData.role,
      });
    }
  }

  return { success: true };
}
