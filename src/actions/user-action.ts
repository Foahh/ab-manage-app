"use server";

import { eq } from "drizzle-orm";
import { IdSchema } from "@/actions/schemas/common-action-schema";
import {
  UserCreateSchema,
  UserUpdateSchema,
} from "@/actions/schemas/user-action-schema";
import { db } from "@/db";
import { usersTable } from "@/db/schemas/users-table";

export async function getAllUsers() {
  return db.select().from(usersTable);
}

export type User = Awaited<ReturnType<typeof getAllUsers>>[number];

export async function addUser(dirt: unknown) {
  const data = UserCreateSchema.parse(dirt);
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
}

export async function editUser(userId: number, dirt: unknown) {
  userId = IdSchema.parse(userId);
  const data = UserUpdateSchema.parse(dirt);

  const [user] = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, userId))
    .returning();

  return user;
}

export async function deleteUser(userId: number) {
  userId = IdSchema.parse(userId);
  await db.delete(usersTable).where(eq(usersTable.id, userId));

  return { success: true };
}
