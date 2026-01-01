import { z } from "zod";
import { promises as fs } from "fs";
import { logger } from "./logger.js";

export const readJsonWithSchemaSafe = async <T>(filePath: string, schema: z.ZodSchema<T>): Promise<T> => {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(rawData);
    const parsed = schema.safeParse(json);

    if(!parsed.success){
      logger.error(parsed.error.issues);
      throw new Error(`[readJsonWithSchema]パースエラー`);
    }
    return parsed.data;
  } catch (e) {
    logger.error(`[readJsonWithSchema]ファイルの読み込み中にエラーが発生しました\nfilepath:${filePath}\n${e}`);
    return schema.parse(undefined);
  }
};

