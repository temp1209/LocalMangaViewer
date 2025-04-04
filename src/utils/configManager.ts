const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "../config.json");

// 設定の読み込み
function getConfig() {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    console.error("config.jsonの読み込みに失敗しました:", error);
    return {};
  }
}

// 設定の書き込み
function setConfig(newConfig) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    console.log("config.jsonに保存しました");
  } catch (error) {
    console.error("config.jsonの書き込みに失敗しました:", error);
  }
}

module.exports = { getConfig, setConfig };
