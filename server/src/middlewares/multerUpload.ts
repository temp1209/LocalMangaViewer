import multer from "multer";

import { paths } from "../config/paths";

//アップロードされたデータの一時保存先
//バックアップとして取っておく
const multerStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, paths.data.uploads);
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

export const multerUpload = multer({ storage: multerStorage });