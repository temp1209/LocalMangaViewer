import express from "express";
const router = express.Router();


//manga
import { getMangaListAPI } from "../controllers/manga/getMangaList";
import { getPageListAPI } from "../controllers/manga/getPageList";
import { getTagListAPI } from "../controllers/manga/getTagList";
import { postMangaUpload } from "../controllers/manga/postMangaUpload";
import { multerUpload } from "../middlewares/multerUpload";

router.get("/manga", getMangaListAPI);
router.get("/manga/:mangaID/pages", getPageListAPI);
router.get("/tag", getTagListAPI);
router.post("/manga", multerUpload.single("file"), postMangaUpload);



//config
import { getConfigAPI } from "../controllers/config/getConfig";
import { setConfigAPI } from "../controllers/config/setConfig";

router.get("/config", getConfigAPI);
router.post("/config", setConfigAPI);

export default router;