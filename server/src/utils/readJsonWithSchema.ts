import z from "zod";
import { promises as fs } from "fs";

export const readJsonWithSchema = async <T>(filePath: string, schema: z.ZodSchema<T>, fallback: T): Promise<T> => {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(rawData);
    const parsed = schema.safeParse(json);

    return parsed.success ? parsed.data : fallback;
  } catch (e) {
    console.error(`[error:readJsonWithSchema]ファイルの読み込みに失敗しました\nfilepath:${filePath}`);
    return fallback;
  }
};
