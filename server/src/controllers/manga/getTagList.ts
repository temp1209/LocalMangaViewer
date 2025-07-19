import fs from "fs";
import { Request , Response } from "express";
import { paths } from "../../config/paths";
import { MetadataList } from "../../schemas/metadataSchema";

// Get
// タグとその登録数を返すAPI
export const getTagList = (req:Request, res:Response) => {
  fs.readFile(paths.data.metadataFile, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load metadata." });
    }
    const allMangaData = JSON.parse(data) as MetadataList;
    const allTagData = allMangaData.map((item) => item.tags).flat();
    const tagFrequency = allTagData.reduce<Record<string, number>>((acc, str) => {
      acc[str] = (acc[str] || 0) + 1;
      return acc;
    }, {});

    const sortedTagData = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);
    const tagDataWithCount = sortedTagData.map(([str, count]) => {
      return { str, count };
    });

    res.json(tagDataWithCount);
  });
};