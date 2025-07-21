import path from "path";
import { UserConfig, userConfigSchema } from "../../schemas/configSchema";
import { defaultUserCongfig } from "../../constants/defaultConfig";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const getUserConfig = async (): Promise<UserConfig> => {
  const data = readJsonWithSchemaSafe(configPath, userConfigSchema, defaultUserCongfig);
  return data;
}
