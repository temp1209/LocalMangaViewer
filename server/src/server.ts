import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import { getConfig } from "./config/configManager";

const app = express();
const PORT = 3000;

// CORS設定
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.resolve("../client/dist")));
app.use(bodyParser.json());


//検索結果へのリダイレクト
//実際の検索は検索結果画面から/api/get-manga-listを呼び出して行う
app.get("/search", (req, res) => {
  const index = req.originalUrl.indexOf("?");
  const queryString = index !== -1 ? req.originalUrl.slice(index) : "";

  res.redirect(`/mangaList.html${queryString}`);
});

// 設定関連のAPI
// 設定を取得
app.get("/api/get-config", (req, res) => {
  try {
    const config = getConfig();
    if (config) {
      res.status(200).json(config);
    } else {
      res.status(404).json({ message: "設定ファイルが見つかりません" });
    }
  } catch (error) {
    console.error("設定の取得に失敗しました:", error);
    res.status(500).json({ message: "設定の取得に失敗しました" });
  }
});

// 設定を保存
app.post("/api/save-config", (req, res) => {
  try {
    const newConfig = req.body;
    
    // 設定ファイルのパスを取得
    const configPath = path.resolve(__dirname, "../config/config.json");
    
    // 既存の設定を読み込み
    let currentConfig = {};
    try {
      const existingData = fs.readFileSync(configPath, "utf-8");
      currentConfig = JSON.parse(existingData);
    } catch (error) {
      console.warn("既存の設定ファイルが見つからないため、新規作成します");
    }
    
    // 新しい設定をマージ
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    // 設定を保存
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
    
    res.status(200).json({ message: "設定を保存しました" });
  } catch (error) {
    console.error("設定の保存に失敗しました:", error);
    res.status(500).json({ message: "設定の保存に失敗しました" });
  }
});


// 本番モードでのみクライアントのビルドファイルを配信
if (process.env.NODE_ENV === "production") {
  // クライアントのルートパスをハンドリング
  app.get("/", (req, res) => {
    res.sendFile(path.resolve("../client/dist/mangaList.html"));
  });

  app.get("/mangaList.html", (req, res) => {
    res.sendFile(path.resolve("../client/dist/mangaList.html"));
  });

  app.get("/tagList.html", (req, res) => {
    res.sendFile(path.resolve("../client/dist/tagList.html"));
  });

  app.get("/upload.html", (req, res) => {
    res.sendFile(path.resolve("../client/dist/upload.html"));
  });

  app.get("/viewer.html", (req, res) => {
    res.sendFile(path.resolve("../client/dist/viewer.html"));
  });

  app.get("/settings.html", (req, res) => {
    res.sendFile(path.resolve("../client/dist/settings.html"));
  });
}

if (process.env.NODE_ENV === "development") {
  // 開発中はサーバーのプロセスから起動
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
