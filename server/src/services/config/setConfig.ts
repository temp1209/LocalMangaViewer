import path from "path";

import { Config } from "shared";
import { writeJson } from "../../utils/writeJson";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const setConfig = async (newConfig: Config) => {
  return await writeJson(configPath, newConfig);
};
