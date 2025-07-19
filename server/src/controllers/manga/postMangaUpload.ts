import fs from "fs";
import path from "path";
import { Request , Response } from "express";
import sizeOf from "image-size";

import { RawMetadataItemSchema,MetadataListSchema ,RawMetadataItem,MetadataList,MetadataItem } from "../../schemas/metadataSchema";
import { paths } from "../../config/paths";
import fileUploadHandlers from "../../utils/fileUploadHandlers";

//POST
//漫画のアップロードAPI
export const postMangaUpload =  async (req:Request, res:Response) => {
  console.log("reqData:", req.body.data);
  let rawData: unknown;
  try {
    rawData = JSON.parse(req.body.data);
  } catch (error) {
    res.status(400).json({ message: "JSONのパースに失敗しました" });
    return;
  }
  console.log("rawData:", rawData);
  const resultReqParse = RawMetadataItemSchema.safeParse(rawData);
  if (!resultReqParse.success) {
    console.error("リクエストデータ形式が不正です");
    res.status(400).json({ message: "リクエストデータ形式が不正です" });
    return;
  }

  const getMangaCover = (manga: RawMetadataItem, id: string): { path: string; isPortrait: boolean } => {
    const dummyCoverName = "DummyCover.png";
    const dummyCoverPath = path.join(paths.data.manga, dummyCoverName);
    const mangaFolder = path.join(paths.data.manga, id);
    try {
      const imageFiles = fs.readdirSync(mangaFolder).filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file));

      if (imageFiles.length === 0) {
        return { path: dummyCoverPath, isPortrait: false };
      }

      const coverImageName = imageFiles[0];
      const coverImagePath = path.join(mangaFolder, coverImageName);

      let isPortrait = false;
      try {
        const { width, height } = sizeOf(coverImagePath);
        isPortrait = height && width ? height > width * 1.2 : false;
      } catch (error) {
        console.warn(`画像サイズ取得に失敗しました: ${coverImagePath}`, error);
      }

      return { path: coverImagePath, isPortrait };
    } catch (error) {
      console.warn(`フォルダが見つかりませんでした:\ntitle:${manga.title}\nid:${id}\n`, error);
      return { path: dummyCoverPath, isPortrait: false };
    }
  };

  const reqMangaData: RawMetadataItem = resultReqParse.data;
  const newMangaID = crypto.randomUUID().toString();
  const newMangaData: MetadataItem = {
    ...reqMangaData,
    id: newMangaID,
    cover: getMangaCover(reqMangaData, newMangaID),
  };
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "ファイルが選択されていません" });
    return;
  }

  const mimeType = file.mimetype;
  if (!fileUploadHandlers[mimeType]) {
    res.status(400).json({ message: "未対応のファイル形式です" });
    return;
  }

  console.log("受信したマンガデータ:", reqMangaData);
  console.log("受信したファイルデータ:", file);

  try {
    await fileUploadHandlers[mimeType](file, newMangaID, paths.data.manga);
  } catch (e) {
    console.error("アップロードファイルの書き込みに失敗しました", e);
    res.status(500).json({ message: "アップロードファイルの書き込みに失敗しました" });
    return;
  }

  try {
    const resultMetadataParse = MetadataListSchema.safeParse(JSON.parse(fs.readFileSync(paths.data.metadataFile, "utf-8")));
    if (!resultMetadataParse.success) {
      throw new Error("metadata.jsonのパースに失敗しました");
    }
    const currentMangaData: MetadataList = resultMetadataParse.data;
    currentMangaData.push(newMangaData);
    fs.writeFileSync(paths.data.metadataFile, JSON.stringify(currentMangaData, null, 2));
    console.log("アップロードに成功しました:", file.filename);
    res.status(200).json({ message: "アップロードに成功しました", mangaData: newMangaData, filename: file.filename });
    return;
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "metadataの書き込みに失敗しました" });
    return;
  }
};