import { z } from "zod";

export const IdSchema = z.number().int().positive();

export const timestampSchemas = {
    created_at: z.date(),
    updated_at: z.date(),
};