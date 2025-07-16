import fs from "fs";
import { Request , Response } from "express";
import { RawMangaQuerySchema,MangaQuery } from "../../schemas/queriesSchema";
import { MetadataSchema } from "../../schemas/metadataSchema";
import { decodeQueryParamArray } from "../../utils/query";
import { SearchableKey } from "../../types/SearchableKey";
import { paths } from "../../config/paths";

// Get
// クエリから検索しマンガ情報を返すAPI
export const getMangaList = (req: Request, res: Response) => {
  const resultReqParse = RawMangaQuerySchema.safeParse(req.query);
  if (!resultReqParse.success) {
    res.status(400).json({ error: "クエリの形式が不正です" });
    return;
  }
  const query = resultReqParse.data;

  const page = query.pageConf.page
  const limit = query.pageConf.limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  if (isNaN(page) || page < 1) {
    res.status(400).json({ error: "ページの指定が不正です" });
    return;
  }

  fs.readFile(paths.data.metadataFile, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "metadataの読み込みに失敗しました" });
      return;
    }

    const resultMetadataParse = MetadataSchema.safeParse(JSON.parse(data));
    if (!resultMetadataParse.success) {
      console.error("metadataのパースに失敗しました");
      res.status(500).json({ error: "metadataのパースに失敗しました" });
      return;
    }
    const allMangaData = resultMetadataParse.data;

    //クエリに合わせて成形
    let formedData = allMangaData;

    if (query.search) {
      const decodedSearchQuery = Object.fromEntries(
        Object.entries(query.search).map(([key, value]) => [key, decodeQueryParamArray(value)])
      ) as MangaQuery["search"];

      for (const key in decodedSearchQuery) {
        const typedKey = key as SearchableKey;
        const queryValues = decodedSearchQuery[typedKey];
        if (!queryValues) continue;

        formedData = formedData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
      }
    }

    //ページに切り取り
    const mangaListPageData = formedData.slice(startIndex, endIndex);

    res.status(200).json({ page, limit, total: formedData.length, data: mangaListPageData });
  });
};