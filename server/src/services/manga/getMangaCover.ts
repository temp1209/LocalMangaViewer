import path from "path";
import { Cover } from "@comic-viewer/shared";
import { paths } from "../../config/paths.js";
import { promises as fs } from "fs";
import { logger } from "../../utils/logger.js";
import { imageSizeFromFile } from "image-size/fromFile";

export const getMangaCover = async (id: string): Promise<Cover | null> => {
  const mangaFolder = path.join(paths.data.manga, id);

  try {
    const stat = await fs.stat(mangaFolder);
    if (!stat.isDirectory()) {
      logger.warn(`[getMangaCover]該当する漫画フォルダが見つかりませんでした:id:${id}`);
      return null;
    }

    const files = await fs.readdir(mangaFolder);
    const imageFiles = files.filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file));

    if (imageFiles.length == 0) {
      logger.warn(`[getMangaCover]フォルダ内に画像がありません\nmangaID:${id}`);
      return null;
    }

    //便宜的に先頭の画像をサムネイルとして選択するように
    //TODO:アップロード時にサムネイルを選択できるようにする
    const coverImageName = imageFiles[0];
    const coverImageFullPath = path.join(paths.data.manga, id, coverImageName);
    
    try {
      const { width, height } = await imageSizeFromFile(coverImageFullPath);
      const isPortrait = height && width ? height > width * 1.2 : false;
      logger.info(`[getMangaCover]サムネイルの取得に成功しました`);
      return { name: coverImageName, isPortrait };
    } catch (error) {
      logger.warn(`[getMangaCover]画像サイズ取得に失敗しました: ${coverImageFullPath}`, error);
      return null;
    }
  } catch (error) {
    logger.error("[getMangaCover]サムネイル取得中にエラーが発生しました",error);
    return null;
  }
};
