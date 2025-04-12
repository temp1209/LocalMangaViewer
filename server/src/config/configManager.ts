import path from "path";
import fs from "fs";
import { UserConfig } from "../../src/types/userConfig";

const configPath = path.resolve(__dirname, "../../config/config.json");

export function getConfig(): UserConfig | null {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("config.jsonの読み込みに失敗しました:", error);
    return null;
  }
}

export function setConfig(newConfig: UserConfig) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    console.log("config.jsonに保存しました");
  } catch (error) {
    console.error("config.jsonの書き込みに失敗しました:", error);
  }
}
