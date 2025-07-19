import path from "path";

import { UserConfig } from "../../schemas/configSchema";
import { writeJson } from "../../utils/writeJson";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const setUserConfig = async (newUserConfig: UserConfig) => {
  return await writeJson(configPath, newUserConfig);
};
