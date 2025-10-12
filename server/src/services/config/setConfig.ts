import path from "path";

import { Config } from "@comic-viewer/shared";
import { writeJson } from "../../utils/writeJson.js";

const configPath = path.resolve(import.meta.dirname, "../../../config/config.json");

export const setConfig = async (newConfig: Config) => {
  const result = await writeJson(configPath, newConfig);
  return result;
};
