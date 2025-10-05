import { paths } from "../../config/paths.js";
import { MetadataItem } from "@comic-viewer/shared";
import fileUploadHandlers from "../../utils/fileUploadHandlers/index.js";
import { writeJson } from "../../utils/writeJson.js";
import { getMangaCover } from "./getMangaCover.js";

export const uploadManga = async (mangaData: MetadataItem, file: Express.Multer.File) => {
  const newMangaID = crypto.randomUUID().toString();
  const newMangaData: MetadataItem = {
    ...mangaData,
    id: newMangaID,
    cover: getMangaCover(mangaData, newMangaID),
  };

  console.log("受信したマンガデータ:", mangaData);
  console.log("受信したファイルデータ:", file);

  const fileUploadOk = await fileUploadHandlers[file.mimetype](file, newMangaID, paths.data.manga);
  if (!fileUploadOk) {
    console.error("[Manga Upload]新しい漫画ファイルの書き込みに失敗しました");
    return false;
  }

  const writeMetadataOk = await writeJson(paths.data.metadataFile, newMangaData);
  if (!writeMetadataOk) {
    console.error("[Manga Upload]新しい漫画データの書き込みに失敗しました");
    return false;
  }

  return true;
};
