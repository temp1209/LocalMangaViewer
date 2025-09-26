import { Request, Response } from "express";

import { MetadataItemSchema } from "../../schemas/metadataSchema";
import fileUploadHandlers from "../../utils/fileUploadHandlers";
import { uploadManga } from "../../services/manga/uploadManga";

//POST
//漫画のアップロードAPI
export const postMangaUpload = async (req: Request, res: Response) => {
  const rawData = req.body.data;
  const file = req.file;
  console.log("rawData:", rawData);

  const resultReqParse = MetadataItemSchema.safeParse(JSON.parse(rawData));
  if (!resultReqParse.success) {
    console.error("リクエストデータ形式が不正です");
    res.status(400).json({ message: "リクエストデータ形式が不正です" });
    return;
  }

  if (!file) {
    res.status(400).json({ message: "ファイルが選択されていません" });
    return;
  }

  const mimeType = file.mimetype;
  if (!fileUploadHandlers[mimeType]) {
    res.status(400).json({ message: "未対応のファイル形式です" });
    return;
  }

  const parsedData = resultReqParse.data;
  const ok = await uploadManga(parsedData,file);

  if (!ok) {
    console.error("アップロードに失敗しました");
    res.status(500).json({ message: "アップロードに失敗しました" });
  }

  console.log("アップロードに成功しました:", file.filename);
  res.status(200).json({ message: "アップロードに成功しました" });
  return;
};
