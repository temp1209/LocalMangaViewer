import express,{Request,Response} from "express";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";
import bodyParser from "body-parser";
import multer from "multer";
import crypto from "crypto";
import fileUploadHandlers from "./src/utils/fileUploadHandlers";
import { MangaQuery,RawMangaQuery } from "./src/types/queries";
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
app.get("/api/get-manga-list", (req:Request<{}, {}, {}, RawMangaQuery>, res:Response) => {
  const page = req.query.pageConf.page ? parseInt(req.query.pageConf.page) : 1;
  const limit = req.query.pageConf.limit ? parseInt(req.query.pageConf.limit) : deafaultPageLimit;
  const decodedSearchQuery = Object.fromEntries(Object.entries(req.query.search).map(([key,value]) => [key,decodeQueryParamArray(value)])) as MangaQuery["search"];

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

    for(const key in decodedSearchQuery){
      const typedKey = key as SearchableKeys;
      formedData.filter((item) => decodedSearchQuery[typedKey].every((v)=>item[typedKey].includes(v)));
    }

    //ページに切り取り
    const mangaListPageData = formedData.slice(startIndex, endIndex);
    const dummyCoverPath = path.join("manga", "DummyCover.png");

    const getMangaCover = (manga:MetadataItem) => {
      try {
        const mangaFolderPath = path.join(mangaDirectory, manga.id);
        const filesInFolder = fs.readdirSync(mangaFolderPath).filter((item) => /\.(png|jpe?g|gif|webp)$/i.test(item));
        const coverImageName = filesInFolder.length > 0 ? encodeURIComponent(filesInFolder[0]) : null;
        const coverImagePath = coverImageName
          ? path.join("manga", encodeURIComponent(manga.id), coverImageName)
          : dummyCoverPath;
        const coverImageSize = sizeOf(path.join(__dirname, "public", decodeURIComponent(coverImagePath)));
        if(coverImageSize.height && coverImageSize.width){
          return { path: coverImagePath, isPortrait: coverImageSize.height > coverImageSize.width * 1.2 };
        }else{
          return { path: coverImagePath, isPortrait: false };
        }
      } catch (error) {
        console.warn(`フォルダが見つかりませんでした:\ntitle:${manga.title}\nid:${manga.id}`, error);
        return {
          path: dummyCoverPath,
          isPortrait: false,
        };
      }
    };

    //カバー画像のデータを含んだJSON
    const mangaData = mangaListPageData.map((manga) => ({ ...manga, cover: getMangaCover(manga) }));

    res.status(200).json({ page, limit, total: formedData.length, data: mangaData });
  });
});

// 指定されたフォルダ内の画像一覧を返すAPI
app.get("/api/get-pages/:mangaID", (req:Request, res:Response) => {
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
    const tagFrequency = allTagData.reduce<Record<string,number>>((acc, str) => {
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
    const newMangaDataWithID:MetadataItem = { ...newMangaData, id: newMangaID };

    const file = req.file;

    if(!file){
      res.status(400).json({message:"ファイルが選択されていません"});
      return;
    }

    const mimeType = file.mimetype;
    console.log(mimeType);

    let isUploadSuccessed = false;

    if (fileUploadHandlers[mimeType]) {
      try {
        await fileUploadHandlers[mimeType](file, newMangaID,uploadDirectory);
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

//ルーティング
//閲覧画面
app.get("/viewer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "viewer.html"));
});

//トップ(全一覧)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mangaList.html"));
});

//検索結果へのリダイレクト
//実際の検索は検索結果画面から/api/get-manga-listを呼び出して行う
app.get("/search", (req, res) => {
  const index = req.originalUrl.indexOf("?");
  const queryString = index !== -1 ? req.originalUrl.slice(index) : "";

  res.redirect(`/mangaList.html${queryString}`);
});

app.get("/taglist", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "taglist.html"));
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mangaUpload.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
