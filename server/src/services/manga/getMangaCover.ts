import path from "path";
import { MetadataItem } from "@comic-viewer/shared";
import { paths } from "../../config/paths.js";
import sizeOf from "image-size";
import fs from "fs";

export const getMangaCover = (manga: MetadataItem, id: string): { path: string; isPortrait: boolean } => {
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
      const { width, height } = sizeOf.imageSize(coverImagePath);
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
