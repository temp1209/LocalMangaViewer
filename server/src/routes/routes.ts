import express from "express";
const router = express.Router();


//manga
import { getMangaListAPI } from "../controllers/manga/getMangaList";
import { getPageList } from "../controllers/manga/getPageList";
import { getTagList } from "../controllers/manga/getTagList";
import { postMangaUpload } from "../controllers/manga/postMangaUpload";
import { multerUpload } from "../middlewares/multerUpload";

router.get("/get-manga-list", getMangaListAPI);
router.get("/get-page/:mangaID", getPageList);
router.get("/get-tag-list", getTagList);
router.post("/post-manga-upload", multerUpload.single("file"), postMangaUpload);



//config
import { getServerConfigAPI } from "../controllers/config/getServerConfig";

router.get("/get-user-config", getServerConfigAPI);

export default router;