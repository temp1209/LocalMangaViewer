import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";
import bodyParser from "body-parser";
import multer from "multer";
import crypto from "crypto";
import fileUploadHandlers from "./src/utils/fileUploadHandlers";
import { MangaQuery, RawMangaQuery } from "./src/types/queries";
import { decodeQueryParamArray } from "./src/utils/query";
import { Metadatas, MetadataItem, SearchableKeys } from "./src/types/metadata";
import { getConfig } from "./src/config/configManager";

const app = express();
const PORT = 3000;

const deafaultPageLimit = 10;

app.use(express.static(path.join(__dirname, "public")));
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
app.get("/api/get-manga-list", (req: Request<{}, {}, {}, RawMangaQuery>, res: Response) => {
  console.log("accessed get-manga-list");
  const pageStr = req.query.pageConf?.page;
  const limitStr = req.query.pageConf?.limit;
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : deafaultPageLimit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (page < 1) {
    res.status(400).json({ error: "Invalid page parameter" });
  }

  fs.readFile(mangaDataPath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load metadata." });
    }
    const allMangaData = JSON.parse(data) as Metadatas;

    //クエリに合わせて成形
    let formedData = allMangaData;

    if (req.query.search) {
      const decodedSearchQuery = Object.fromEntries(
        Object.entries(req.query.search).map(([key, value]) => [key, decodeQueryParamArray(value)])
      ) as MangaQuery["search"];

      for (const key in decodedSearchQuery) {
        const typedKey = key as SearchableKeys;
        formedData.filter((item) => decodedSearchQuery[typedKey].every((v) => item[typedKey].includes(v)));
      }
    }

    //ページに切り取り
    const mangaListPageData = formedData.slice(startIndex, endIndex);

    //カバー画像パス取得
    const dummyCoverName = "DummyCover.png";
    const dummyCoverPath = path.join(mangaDirectory, dummyCoverName);

    const getMangaCover = (manga: MetadataItem): { path: string; isPortrait: boolean } => {
      const mangaFolder = path.join(mangaDirectory, manga.id);
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
        console.warn(`フォルダが見つかりませんでした:\ntitle:${manga.title}\nid:${manga.id}\n`, error);
        return { path: dummyCoverPath, isPortrait: false };
      }
    };

    //カバー画像のデータを含んだJSON
    const mangaData = mangaListPageData.map((manga) => ({ ...manga, cover: getMangaCover(manga) }));

    res.status(200).json({ page, limit, total: formedData.length, data: mangaData });
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
      .map((file) => `/manga/${mangaID}/${encodeURIComponent(file)}`);

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
    const allMangaData = JSON.parse(data) as Metadatas;
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
  try {
    const newMangaData = JSON.parse(req.body.data);
    console.log("受信したマンガデータ:", newMangaData);
    console.log("受信したファイルデータ:", req.file);

    const newMangaID = crypto.randomUUID().toString();
    const newMangaDataWithID: MetadataItem = { ...newMangaData, id: newMangaID };

    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "ファイルが選択されていません" });
      return;
    }

    const mimeType = file.mimetype;
    console.log(mimeType);

    let isUploadSuccessed = false;

    if (fileUploadHandlers[mimeType]) {
      try {
        await fileUploadHandlers[mimeType](file, newMangaID, uploadDirectory);
        isUploadSuccessed = true;
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "アップロード処理に失敗しました" });
      }
    } else {
      res.status(400).json({ message: "未対応のファイル形式です" });
    }

    if (isUploadSuccessed) {
      const currentMangaData = JSON.parse(fs.readFileSync(mangaDataPath, "utf-8"));
      if (Array.isArray(currentMangaData)) {
        currentMangaData.push(newMangaDataWithID);
      } else {
        console.error("metadata.jsonの形式が不正です");
        return;
      }
      fs.writeFileSync(mangaDataPath, JSON.stringify(currentMangaData, null, 2));
      res.status(200).json({ message: "アップロードに成功しました", mangaData: newMangaDataWithID, file: req.file });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "アップロードに失敗しました" });
  }
});

//検索結果へのリダイレクト
//実際の検索は検索結果画面から/api/get-manga-listを呼び出して行う
app.get("/search", (req, res) => {
  const index = req.originalUrl.indexOf("?");
  const queryString = index !== -1 ? req.originalUrl.slice(index) : "";

  res.redirect(`/mangaList.html${queryString}`);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
