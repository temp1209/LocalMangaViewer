import express from "express";
const router = express.Router();


//manga
import { getMangaListAPI } from "../controllers/manga/getMangaList.js";
import { getPageListAPI } from "../controllers/manga/getPageList.js";
import { getTagListAPI } from "../controllers/manga/getTagList.js";
import { postMangaUpload } from "../controllers/manga/postMangaUpload.js";
import { multerUpload } from "../middlewares/multerUpload.js";

router.get("/manga", getMangaListAPI);
router.get("/manga/:mangaID/pages", getPageListAPI);
router.get("/tag", getTagListAPI);
router.post("/manga", multerUpload.single("file"), postMangaUpload);



//config
import { getConfigAPI } from "../controllers/config/getConfig.js";
import { setConfigAPI } from "../controllers/config/setConfig.js";

router.get("/config", getConfigAPI);
router.post("/config", setConfigAPI);

export default router;