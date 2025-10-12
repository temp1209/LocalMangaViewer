import { promises as fs } from "fs"
import path from "path";
import { paths } from "../../config/paths.js";

export const getPageList = async (mangaID:string) => {
  const mangaPath = path.join(paths.data.manga,mangaID);
  const fileList = await fs.readdir(mangaPath);

  const pageFiles = fileList
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => encodeURI(file));
  
  return pageFiles;
}