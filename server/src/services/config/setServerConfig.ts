import path from "path";

import { writeJson } from "../../utils/writeJson";
import { ServerConfig } from "../../schemas/configSchema";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const setServerConfig = async (newServerConfig: ServerConfig) => {
  return await writeJson(configPath, newServerConfig);
};
