"use server";

import { eq } from "drizzle-orm";
import { MultipleCustomDesignersSchema } from "@/actions/schemas/custom-designer-action-schema";
import { db } from "@/db";
import { customDesignerTable } from "@/db/schemas/custom-designer-table";

export async function getAllCustomDesigners() {
  return db.select().from(customDesignerTable);
}

export async function getCustomDesignersBySongId(songId: number) {
  return db
    .select()
    .from(customDesignerTable)
    .where(eq(customDesignerTable.songId, songId));
}

export type CustomDesigner = Awaited<
  ReturnType<typeof getAllCustomDesigners>
>[number];

export async function updateMultipleCustomDesigners(dirt: unknown) {
  const data = MultipleCustomDesignersSchema.parse(dirt);
  const songId = data.songId;
  if (songId == null) {
    throw new Error("Song ID is required");
  }

  await db
    .delete(customDesignerTable)
    .where(eq(customDesignerTable.songId, songId));

  if (data.designers.length > 0) {
    await db.insert(customDesignerTable).values(
      data.designers.map((d) => ({
        songId,
        label: d.label,
        role: d.role,
      })),
    );
  }

  return { success: true };
}
