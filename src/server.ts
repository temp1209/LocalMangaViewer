const express = require("express");
const path = require("path");
const fs = require("fs");
const sizeOf = require("image-size");
const bodyParser = require("body-parser");
const multer = require("multer");
const crypto = require("crypto");
const fileUploadHandlers = require("./fileUploadHandlers");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const mangaDataPath = path.join(__dirname, "data", "metadata.json");
const mangaDirectory = path.join(__dirname, "public", "manga");

//アップロードされたデータの一時保存先
//バックアップとして取っておく
const multerStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.resolve(__dirname, "./uploads"));
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerUpload = multer({ storage: multerStorage });

// Get
// マンガ情報を返すAPI
app.get("/api/get-manga-list", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const author = req.query.author ? decodeURIComponent(req.query.author) : null;
  const original = req.query.original ? decodeURIComponent(req.query.original) : null;
  const charactor = req.query.charactor ? decodeURIComponent(req.query.charactor) : null;
  const tag = req.query.tag ? decodeURIComponent(req.query.tag) : null;

  const limit = 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (page < 1) {
    return res.status(400).json({ error: "Invalid page parameter" });
  }

  fs.readFile(mangaDataPath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load metadata." });
    }
    const allMangaData = JSON.parse(data);

    //クエリに合わせて成形
    let formedData = allMangaData;

    if (author) formedData = formedData.filter((item) => item.authors.includes(author));
    if (original) formedData = formedData.filter((item) => item.originals.includes(original));
    if (charactor) formedData = formedData.filter((item) => item.charactors.includes(charactor));
    if (tag) formedData = formedData.filter((item) => item.tags.includes(tag));

    //ページに切り取り
    const mangaListPageData = formedData.slice(startIndex, endIndex);
    const dummyCoverPath = path.join("manga", "DummyCover.png");

    const getMangaCover = (manga) => {
      try {
        const mangaFolderPath = path.join(mangaDirectory, manga.id);
        const filesInFolder = fs.readdirSync(mangaFolderPath).filter((item) => /\.(png|jpe?g|gif|webp)$/i.test(item));
        const coverImageName = filesInFolder.length > 0 ? encodeURIComponent(filesInFolder[0]) : null;
        const coverImagePath = coverImageName
          ? path.join("manga", encodeURIComponent(manga.id), coverImageName)
          : dummyCoverPath;
        const coverImageSize = sizeOf(path.join(__dirname, "public", decodeURIComponent(coverImagePath)));

        return { path: coverImagePath, isPortrait: coverImageSize.height > coverImageSize.width * 1.2 };
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

    res.json({ page, limit, total: formedData.length, data: mangaData });
  });
});

// 指定されたフォルダ内の画像一覧を返すAPI
app.get("/api/get-pages/:mangaID", (req, res) => {
  const mangaID = req.params.mangaID;
  const mangaPath = path.join(mangaDirectory, mangaID);

  fs.readdir(mangaPath, (err, files) => {
    if (err) {
      return res.status(500).send("Failed to read folder");
    }

    // 画像ファイルのみフィルタリングして返す
    const pageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => `/manga/${mangaID}/${encodeURIComponent(file)}`);

    res.json(pageFiles);
  });
});

//タグとその登録数を返すAPI
app.get("/api/get-tag-list", (req, res) => {
  fs.readFile(mangaDataPath, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load metadata." });
    }
    const allMangaData = JSON.parse(data);
    const alltagData = allMangaData.map((item) => item.tags).flat();
    const tagFrequency = alltagData.reduce((acc, str) => {
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
    const newMangaDataWithID = { ...newMangaData, id: newMangaID };

    const file = req.file;
    const mimeType = file.mimetype;
    console.log(mimeType);

    let isUploadSuccessed = false;

    if (fileUploadHandlers[mimeType]) {
      try {
        await fileUploadHandlers[mimeType](file, newMangaID);
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
  const { author, original, charactor, tag } = req.query;

  const queryParams = [];

  if (author) queryParams.push(`author=${encodeURIComponent(author)}`);
  if (original) queryParams.push(`original=${encodeURIComponent(original)}`);
  if (charactor) queryParams.push(`charactor=${encodeURIComponent(charactor)}`);
  if (tag) queryParams.push(`tag=${encodeURIComponent(tag)}`);

  const redirectQuery = queryParams.join("&");

  res.redirect(`/mangaList.html?${redirectQuery}`);
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
