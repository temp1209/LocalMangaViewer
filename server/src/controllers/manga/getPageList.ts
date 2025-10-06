import { Request , Response } from "express";
import { getPageList } from "../../services/manga/getMangaPageList.js";
import { logger } from "../../utils/logger.js";

// Get
// 指定されたフォルダ内の画像一覧を返すAPI
export const getPageListAPI = async (req: Request, res: Response) => {
  const mangaID = req.params.mangaID;
  const pageList = await getPageList(mangaID);

  logger.info("[getPageList]漫画のページ一覧を取得しました");
  logger.log("[getPageList]総ページ数:",pageList.length);
  res.status(200).json(pageList);
};