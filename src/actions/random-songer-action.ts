"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { songerTable } from "@/db/schemas/songer-table";
import { songsTable } from "@/db/schemas/songs-table";
import { usersTable } from "@/db/schemas/users-table";
import { shuffle } from "@/lib/shuffle";

const minSongers = 4;

export async function randomAssignSongers() {
  if (minSongers <= 0) {
    throw new Error("minSongers must be > 0");
  }

  const [songs, users, songers] = await Promise.all([
    db.select().from(songsTable).where(eq(songsTable.isBonus, false)),
    db.select().from(usersTable),
    db.select().from(songerTable),
  ]);

  const participants = users
    .filter((u) => !u.isJammer)
    .filter((u) => {
      return songers.some((s) => s.userId === u.id && s.role === "real");
    });

  if (participants.length === 0) {
    throw new Error("No users available to assign as songers");
  }

  const resultPerSong: Array<{
    songId: number;
    existing: number;
    added: number;
    final: number;
  }> = [];

  await db.transaction(async (trx) => {
    const bySong = new Map<number, typeof songers>();
    for (const s of songers) {
      let arr = bySong.get(s.songId);
      if (!arr) {
        const newArr: typeof songers = [];
        bySong.set(s.songId, newArr);
        arr = newArr;
      }
      arr.push(s);
    }

    const userCounts = new Map<number, number>();
    for (const s of songers) {
      if (s.role === "fake_random") {
        continue;
      }
      userCounts.set(s.userId, (userCounts.get(s.userId) || 0) + 1);
    }
    const getCount = (uid: number) => userCounts.get(uid) || 0;

    shuffle(songs);

    for (const song of songs) {
      const existingAll = bySong.get(song.id) || [];
      const existingAssigned = existingAll.filter(
        (s) => s.role !== "fake_random",
      );
      const existingUserIds = new Set(existingAssigned.map((s) => s.userId));

      const priorRandoms = existingAll.filter((s) => s.role === "fake_random");
      for (const r of priorRandoms) {
        await trx
          .delete(songerTable)
          .where(
            and(
              eq(songerTable.songId, r.songId),
              eq(songerTable.userId, r.userId),
            ),
          );
      }

      const existingCount = existingAssigned.filter((u) => {
        return !users.find((p) => p.id === u.userId)?.isJammer;
      }).length;

      const needed = Math.max(0, minSongers - existingCount);

      let added = 0;
      if (needed > 0) {
        const candidates = participants.filter(
          (u) => !existingUserIds.has(u.id),
        );

        if (candidates.length === 0) {
          continue;
        }

        for (let i = 0; i < needed; i++) {
          const remaining = candidates.filter(
            (c) => !existingUserIds.has(c.id),
          );
          if (remaining.length === 0) {
            break;
          }

          let minCount = Infinity;
          for (const c of remaining) {
            const cCount = getCount(c.id);
            if (cCount < minCount) {
              minCount = cCount;
            }
          }

          const pool = shuffle(
            remaining.filter((c) => getCount(c.id) === minCount),
          );

          const pick = pool[0];
          if (!pick) {
            break;
          }

          await trx.insert(songerTable).values({
            songId: song.id,
            userId: pick.id,
            role: "fake_random",
          });

          existingUserIds.add(pick.id);
          userCounts.set(pick.id, getCount(pick.id) + 1);
          added++;
        }
      }

      resultPerSong.push({
        songId: song.id,
        existing: existingCount,
        added,
        final: existingCount + added,
      });
    }
  });

  return { success: true, summary: resultPerSong };
}
