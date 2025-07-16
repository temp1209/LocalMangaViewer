import express from "express";
import { getMangaList } from "../controllers/manga/getMangaList";
import { getPages } from "../controllers/manga/getPages";
import { getTagList } from "../controllers/manga/getTagList";
import { postMangaUpload } from "../controllers/manga/postMangaUpload";
import { multerUpload } from "../middlewares/multerUpload";

const router = express.Router();

router.get("/get-manga-list", getMangaList);
router.get("/get-pages/:mangaID", getPages);
router.get("/get-tag-list", getTagList);
router.post("/post-manga-upload", multerUpload.single("file"), postMangaUpload);

export default router;
