import { promises as fs } from "fs";
import { logger } from "./logger.js";

export const appendArrayJson = async <T extends Object>(filePath: string, data: T): Promise<boolean> => {
  try {
    const currentData = await fs.readFile(filePath);
    const parsedCurrentData: T[] = currentData ? JSON.parse(currentData.toString()) : [];
    const appendedData = [...parsedCurrentData, data];
    const result = await fs.writeFile(filePath, JSON.stringify(appendedData, null, 2), "utf-8");
    return true;
  } catch (e) {
    logger.error(`[appendJson] ファイル書き込みに失敗しました\nfilepath: ${filePath}`);
    return false;
  }
};
