import fs from "fs";
import { Request, Response } from "express";
import { countTags } from "../../services/manga/countTags";

// Get
// タグとその登録数を返すAPI
export const getTagListAPI = async (req: Request, res: Response) => {
  const tagList = await countTags();
  res.status(200).json(tagList);
};
