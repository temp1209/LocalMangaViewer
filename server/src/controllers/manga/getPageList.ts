import fs from "fs";
import path from "path";
import { Request , Response } from "express";
import { paths } from "../../config/paths";

// Get
// 指定されたフォルダ内の画像一覧を返すAPI
export const getPageList = (req: Request, res: Response) => {
  const mangaID = req.params.mangaID;
  const mangaPath = path.join(paths.data.manga, mangaID);

  fs.readdir(mangaPath, (err, files) => {
    if (err) {
      res.status(500).send("Failed to read folder");
    }

    // 画像ファイルのみフィルタリングして返す
    const pageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => path.join(mangaPath, encodeURI(file)));

    res.status(200).json(pageFiles);
  });
};