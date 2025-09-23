import path from "path";
import { Config, configSchema } from "../../schemas/configSchema";
import { defaultCongfig } from "../../constants/defaultConfig";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema";

const relativePath = "../../config/config.json";

export const getConfig = async (): Promise<Config> => {
  const data = await readJsonWithSchemaSafe(relativePath,configSchema,defaultCongfig);
  return data;
}
