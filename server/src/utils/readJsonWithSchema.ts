import { z } from "zod";
import { promises as fs } from "fs";
import { logger } from "./logger.js";

export const readJsonWithSchemaSafe = async <T>(filePath: string, schema: z.ZodSchema<T>, fallback: T): Promise<T> => {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(rawData);
    const parsed = schema.safeParse(json);

    return parsed.success ? parsed.data : fallback;
  } catch (e) {
    logger.error(`[readJsonWithSchema]ファイルの読み込みに失敗しました\nfilepath:${filePath}`);
    return fallback;
  }
};

export const readJsonWithSchemaStrict = async <T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> => {
  const rawData = await fs.readFile(filePath, "utf-8");
  const json = JSON.parse(rawData);
  const parsed = schema.parse(json);

  return parsed;
};
