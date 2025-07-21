import path from "path";
import { ServerConfig, serverConfigSchema } from "../../schemas/configSchema";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema";
import { defaultServerCongfig } from "../../constants/defaultConfig";

const configPath = path.resolve(__dirname, "../../config/config.json");

export const getServerConfig = async (): Promise<ServerConfig> => {
  const data = await readJsonWithSchemaSafe(configPath,serverConfigSchema,defaultServerCongfig);
  return data;
}
