import { loadEnvConfig } from "@next/env";
import { z } from "zod";

export const projectDir = process.cwd();
loadEnvConfig(projectDir);

const schema = z.object({
  DATABASE_URL: z.string().min(1),
});

export const env = schema.parse(process.env);
