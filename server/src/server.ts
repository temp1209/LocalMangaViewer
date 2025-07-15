import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";
import bodyParser from "body-parser";
import multer from "multer";
import crypto from "crypto";
import fileUploadHandlers from "./utils/fileUploadHandlers";
import { MangaQuery, RawMangaQuerySchema } from "./schemas/queriesSchema";
import { decodeQueryParamArray } from "./utils/query";
import {
  Metadata,
  MetadataItem,
  MetadataSchema,
  RawMetadataItemSchema,
  RawMetadataItem,
} from "./schemas/metadataSchema";
import { SearchableKey } from "./types/SearchableKey";
import { getConfig } from "./config/configManager";
import { error } from "console";

const app = express();
const PORT = 3000;

const defaultPageLimit = 10;

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

const dataDirectory = getConfig()?.dataDirectory!;
const mangaDataPath = path.join(dataDirectory, "metadata", "metadata.json");
const mangaDirectory = path.join(dataDirectory, "manga");
const uploadDirectory = path.join(dataDirectory, "uploads");

//アップロードされたデータの一時保存先
//バックアップとして取っておく
const multerStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerUpload = multer({ storage: multerStorage });

// Get
// マンガ情報を返すAPI
app.get("/api/get-manga-list", (req: Request, res: Response) => {
  const resultReqParse = RawMangaQuerySchema.safeParse(req.query);
  if (!resultReqParse.success) {
    res.status(400).json({ error: "クエリの形式が不正です" });
    return;
  }
  const query = resultReqParse.data;

  const page = query.pageConf.page
  const limit = query.pageConf.limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (isNaN(page) || page < 1) {
    res.status(400).json({ error: "ページの指定が不正です" });
    return;
  }

  fs.readFile(mangaDataPath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "metadataの読み込みに失敗しました" });
      return;
    }

    const resultMetadataParse = MetadataSchema.safeParse(JSON.parse(data));
    if (!resultMetadataParse.success) {
      console.error("metadataのパースに失敗しました");
      res.status(500).json({ error: "metadataのパースに失敗しました" });
      return;
    }
    const allMangaData = resultMetadataParse.data;

    //クエリに合わせて成形
    let formedData = allMangaData;

    if (query.search) {
      const decodedSearchQuery = Object.fromEntries(
        Object.entries(query.search).map(([key, value]) => [key, decodeQueryParamArray(value)])
      ) as MangaQuery["search"];

      for (const key in decodedSearchQuery) {
        const typedKey = key as SearchableKey;
        const queryValues = decodedSearchQuery[typedKey];
        if (!queryValues) continue;

        formedData = formedData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
      }
    }

    //ページに切り取り
    const mangaListPageData = formedData.slice(startIndex, endIndex);

    res.status(200).json({ page, limit, total: formedData.length, data: mangaListPageData });
  });
});

// 指定されたフォルダ内の画像一覧を返すAPI
app.get("/api/get-pages/:mangaID", (req: Request, res: Response) => {
  const mangaID = req.params.mangaID;
  const mangaPath = path.join(mangaDirectory, mangaID);

  fs.readdir(mangaPath, (err, files) => {
    if (err) {
      res.status(500).send("Failed to read folder");
    }

    // 画像ファイルのみフィルタリングして返す
    const pageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => path.join(mangaPath, encodeURI(file)));

    res.status(200).json(pageFiles);
  });
});

//タグとその登録数を返すAPI
app.get("/api/get-tag-list", (req, res) => {
  fs.readFile(mangaDataPath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load metadata." });
    }
    const allMangaData = JSON.parse(data) as Metadata;
    const allTagData = allMangaData.map((item) => item.tags).flat();
    const tagFrequency = allTagData.reduce<Record<string, number>>((acc, str) => {
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {});

    const sortedTagData = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);
    const tagDataWithCount = sortedTagData.map(([str, count]) => {
      return { str, count };
    });

    res.json(tagDataWithCount);
  });
});

//POST
//漫画のアップロードAPI
app.post("/api/post-manga-upload", multerUpload.single("file"), async (req, res) => {
  console.log("reqData:", req.body.data);
  let rawData: unknown;
  try {
    rawData = JSON.parse(req.body.data);
  } catch (error) {
    res.status(400).json({ message: "JSONのパースに失敗しました" });
    return;
  }
  console.log("rawData:", rawData);
  const resultReqParse = RawMetadataItemSchema.safeParse(rawData);
  if (!resultReqParse.success) {
    console.error("リクエストデータ形式が不正です");
    res.status(400).json({ message: "リクエストデータ形式が不正です" });
    return;
  }

  const getMangaCover = (manga: RawMetadataItem, id: string): { path: string; isPortrait: boolean } => {
    const dummyCoverName = "DummyCover.png";
    const dummyCoverPath = path.join(mangaDirectory, dummyCoverName);
    const mangaFolder = path.join(mangaDirectory, id);
    try {
      const imageFiles = fs.readdirSync(mangaFolder).filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file));

      if (imageFiles.length === 0) {
        return { path: dummyCoverPath, isPortrait: false };
      }

      const coverImageName = imageFiles[0];
      const coverImagePath = path.join(mangaFolder, coverImageName);

      let isPortrait = false;
      try {
        const { width, height } = sizeOf(coverImagePath);
        isPortrait = height && width ? height > width * 1.2 : false;
      } catch (error) {
        console.warn(`画像サイズ取得に失敗しました: ${coverImagePath}`, error);
      }

      return { path: coverImagePath, isPortrait };
    } catch (error) {
      console.warn(`フォルダが見つかりませんでした:\ntitle:${manga.title}\nid:${id}\n`, error);
      return { path: dummyCoverPath, isPortrait: false };
    }
  };

  const reqMangaData: RawMetadataItem = resultReqParse.data;
  const newMangaID = crypto.randomUUID().toString();
  const newMangaData: MetadataItem = {
    ...reqMangaData,
    id: newMangaID,
    cover: getMangaCover(reqMangaData, newMangaID),
  };
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "ファイルが選択されていません" });
    return;
  }

  const mimeType = file.mimetype;
  if (!fileUploadHandlers[mimeType]) {
    res.status(400).json({ message: "未対応のファイル形式です" });
    return;
  }

  console.log("受信したマンガデータ:", reqMangaData);
  console.log("受信したファイルデータ:", file);

  try {
    await fileUploadHandlers[mimeType](file, newMangaID, mangaDirectory);
  } catch (e) {
    console.error("アップロードファイルの書き込みに失敗しました", e);
    res.status(500).json({ message: "アップロードファイルの書き込みに失敗しました" });
    return;
  }

  try {
    const resultMetadataParse = MetadataSchema.safeParse(JSON.parse(fs.readFileSync(mangaDataPath, "utf-8")));
    if (!resultMetadataParse.success) {
      throw new Error("metadata.jsonのパースに失敗しました");
    }
    const currentMangaData: Metadata = resultMetadataParse.data;
    currentMangaData.push(newMangaData);
    fs.writeFileSync(mangaDataPath, JSON.stringify(currentMangaData, null, 2));
    console.log("アップロードに成功しました:", file.filename);
    res.status(200).json({ message: "アップロードに成功しました", mangaData: newMangaData, filename: file.filename });
    return;
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "metadataの書き込みに失敗しました" });
    return;
  }
});

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

// キャッシュをクリア
app.post("/api/clear-cache", (req, res) => {
  try {
    // ここでキャッシュクリアの処理を実装
    // 現在はダミーの実装
    console.log("キャッシュをクリアしました");
    res.status(200).json({ message: "キャッシュをクリアしました" });
  } catch (error) {
    console.error("キャッシュのクリアに失敗しました:", error);
    res.status(500).json({ message: "キャッシュのクリアに失敗しました" });
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

console.log("NodeEnv:", process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  // 開発中はサーバーのプロセスから起動
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
