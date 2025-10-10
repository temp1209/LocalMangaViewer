import { Request, Response } from "express";

import { MetadataUploadSchema } from "@comic-viewer/shared";
import fileUploadHandlers from "../../utils/fileUploadHandlers/index.js";
import { uploadManga } from "../../services/manga/uploadManga.js";
import { logger } from "../../utils/logger.js";

//POST
//漫画のアップロードAPI
export const postMangaUpload = async (req: Request, res: Response) => {
  const rawData = req.body.data;
  const file = req.file;
  logger.info("[mangaUpload]アップロード漫画生データ:", rawData);

  const resultReqParse = MetadataUploadSchema.safeParse(JSON.parse(rawData));
  if (!resultReqParse.success) {
    logger.error("[mangaUpload]データパースエラー:",resultReqParse.error.message);
    res.status(400).json({ message: "リクエストデータ形式が不正です" });
    return;
  }

  if (!file) {
    logger.error("[mangaUpload]ファイルがが選択されていません");
    res.status(400).json({ message: "ファイルが選択されていません" });
    return;
  }

  const mimeType = file.mimetype;
  if (!fileUploadHandlers[mimeType]) {
    logger.error("[mangaUpload]未対応のファイル形式です");
    res.status(400).json({ message: "未対応のファイル形式です" });
    return;
  }

  const parsedData = resultReqParse.data;
  const ok = await uploadManga(parsedData,file);

  if (!ok) {
    logger.error("[mangaUpload]アップロードに失敗しました");
    res.status(500).json({ message: "アップロードに失敗しました" });
  }

  logger.log("[mangaUpload]アップロードに成功しました:", file.filename);
  res.status(200).json({ message: "アップロードに成功しました" });
  return;
};
