const express = require("express");
const path = require("path");
const fs = require("fs");
const sizeOf = require("image-size");
const bodyParser = require("body-parser");
const multer = require("multer");
const unzipper = require("unzipper");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerUpload = multer({storage:multerStorage});

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

  const mangaDataPath = path.join(__dirname, "public", "manga", "metadata.json");
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
    const dummyCoverPath = path.join(__dirname, "public", "manga", "DummyCover.png");

    const mangaData = mangaListPageData.map((manga) => {
      const mangaFolderPath = path.join(__dirname, "public", "manga", manga.title);
      const filesInFolder = fs.readdirSync(mangaFolderPath).filter((item) => /\.(png|jpe?g|gif|webp)$/i.test(item));
      const coverImageName = filesInFolder.length > 0 ? encodeURIComponent(filesInFolder[0]) : null;
      const coverImagePath = coverImageName
        ? path.join("manga", encodeURIComponent(manga.title), coverImageName)
        : dummyCoverPath;
      const coverImageSize = sizeOf(path.join(__dirname, "public", decodeURIComponent(coverImagePath)));

      return {
        ...manga,
        cover: { path: coverImagePath, isPortrait: coverImageSize.height > coverImageSize.width * 1.2 },
      };
    });

    res.json({ page, limit, total: formedData.length, data: mangaData });
  });
});

// 指定されたフォルダ内の画像一覧を返すAPI
app.get("/api/get-pages/:mangaName", (req, res) => {
  const mangaName = decodeURIComponent(req.params.mangaName);
  const mangaPath = path.join(__dirname, "public", "manga", mangaName);

  fs.readdir(mangaPath, (err, files) => {
    if (err) {
      return res.status(500).send("Failed to read folder");
    }

    // 画像ファイルのみフィルタリングして返す
    const pageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => `/manga/${encodeURIComponent(mangaName)}/${encodeURIComponent(file)}`);

    res.json(pageFiles);
  });
});

//タグとその登録数を返すAPI
app.get("/api/get-tag-list", (req, res) => {
  const mangaDataPath = path.join(__dirname, "public", "manga", "metadata.json");
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
app.post("/api/post-manga-upload", multerUpload.single("file"), (req, res) => {
  try{
    const mangaData = JSON.parse(req.body.data);
    console.log("受信したデータ:",mangaData);
    const fileInfo = req.file;
    console.log('アップロードされたファイル:', fileInfo);

    res.status(200).json({message:"アップロードに成功しました",mangaData,fileInfo})
  } catch (e){
    console.error(e);
    res.status(500).json({message:"アップロードに失敗しました"});
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
