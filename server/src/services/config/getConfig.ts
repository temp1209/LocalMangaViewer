import { Config, configSchema, defaultConfig } from "shared";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema";

const relativePath = "../../config/config.json";

export const getConfig = async (): Promise<Config> => {
  const data = await readJsonWithSchemaSafe(relativePath, configSchema, defaultConfig);
  return data;
};
