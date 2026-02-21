"use server";

import { and, eq } from "drizzle-orm";
import { IdSchema } from "@/actions/schemas/common-action-schema";
import {
  MultipleDesignersSchema,
  DesignerCreateSchema,
  DesignerUpdateSchema,
} from "@/actions/schemas/designer-action-schema";
import { db } from "@/db";
import { designerTable } from "@/db/schemas/designer-table";

export async function getAllDesigners() {
  return db.select().from(designerTable);
}

export async function getSomeDesigners(songId: number) {
  return db
    .select()
    .from(designerTable)
    .where(eq(designerTable.songId, IdSchema.parse(songId)));
}

export type Designer = Awaited<ReturnType<typeof getAllDesigners>>[number];

export async function addDesigner(dirt: unknown) {
  const data = DesignerCreateSchema.parse(dirt);
  const [user] = await db.insert(designerTable).values(data).returning();

  return user;
}

export async function editDesigner(
  songId: number,
  userId: number,
  dirt: unknown,
) {
  const data = DesignerUpdateSchema.parse(dirt);

  const [user] = await db
    .update(designerTable)
    .set(data)
    .where(
      and(
        eq(designerTable.songId, IdSchema.parse(songId)),
        eq(designerTable.userId, IdSchema.parse(userId)),
      ),
    )
    .returning();

  return user;
}

export async function deleteDesigner(songId: number, userId: number) {
  await db
    .delete(designerTable)
    .where(
      and(
        eq(designerTable.songId, IdSchema.parse(songId)),
        eq(designerTable.userId, IdSchema.parse(userId)),
      ),
    );

  return { success: true };
}

export async function updateMultipleDesigners(dirt: unknown) {
  const data = MultipleDesignersSchema.parse(dirt);
  if (!data.songId) {
    throw new Error("Song ID is required");
  }

  const existingDesigners = await getSomeDesigners(data.songId);
  const existingUserIds = new Set(existingDesigners.map((s) => s.userId));
  const newUserIds = new Set(data.designers.map((s) => s.userId));

  const usersToDelete = existingDesigners.filter(
    (s) => !newUserIds.has(s.userId),
  );
  for (const designer of usersToDelete) {
    await deleteDesigner(data.songId, designer.userId);
  }

  for (const designerData of data.designers) {
    if (!designerData.userId) {
      continue;
    }

    if (existingUserIds.has(designerData.userId)) {
      await editDesigner(data.songId, designerData.userId, {
        role: designerData.role,
      });
    } else {
      await addDesigner({
        songId: data.songId,
        userId: designerData.userId,
        role: designerData.role,
      });
    }
  }

  return { success: true };
}
