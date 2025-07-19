import path from "path";
import { UserConfig, userConfigSchema } from "../../schemas/configSchema";
import { defaultUserCongfig } from "../../constants/defaultConfig";
import { readJsonWithSchema } from "../../utils/readJsonWithSchema";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const getUserConfig = async (): Promise<UserConfig> => {
  const data = readJsonWithSchema(configPath, userConfigSchema, defaultUserCongfig);
  return data;
}
