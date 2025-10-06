import { Config, configSchema, defaultConfig } from "@comic-viewer/shared";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema.js";
import path from "path";

const configPath = path.resolve(import.meta.dirname,"../../../config/config.json");

export const getConfig = async (): Promise<Config> => {
  const data = await readJsonWithSchemaSafe(configPath, configSchema, defaultConfig);
  return data;
};
