import fs from "fs";
import path from "path";
import { Request , Response } from "express";
import { paths } from "../../config/paths";
import { getPageList } from "../../services/manga/getMangaPageList";

// Get
// 指定されたフォルダ内の画像一覧を返すAPI
export const getPageListAPI = async (req: Request, res: Response) => {
  const mangaID = req.params.mangaID;
  const pageList = await getPageList(mangaID);

  res.status(200).json(pageList);
};