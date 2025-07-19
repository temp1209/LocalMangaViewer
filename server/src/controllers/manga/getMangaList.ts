import { Request, Response } from "express";
import { RawMangaQuerySchema, MangaQuery, SearchQuery, SearchQuerySchema } from "../../schemas/queriesSchema";
import { MetadataList, MetadataListSchema } from "../../schemas/metadataSchema";
import { decodeQueryParamArray } from "../../utils/query";
import { SearchableKey } from "../../types/SearchableKey";
import { paths } from "../../config/paths";
import { readJsonWithSchema } from "../../utils/readJsonWithSchema";
import { mapObjectValues } from "../../utils/mapObjectValues";

// Get
// クエリから検索しマンガ情報を返すAPI
export const getMangaList = async (req: Request, res: Response) => {
  const resultReqParse = RawMangaQuerySchema.safeParse(req.query);
  if (!resultReqParse.success) {
    console.error(resultReqParse.error.message);
    res.status(400).json({ error: "クエリの形式が不正です" });
    return;
  }
  const query = resultReqParse.data;

  const page = query.pageConf.page;
  const limit = query.pageConf.limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const decodedSearchQuery = mapObjectValues(query.search,decodeQueryParamArray);

  let resultData:MetadataList = [];
  try {
    const metadata = await readJsonWithSchema(paths.data.metadataFile, MetadataListSchema, []);
    resultData = metadata;

    for (const key in decodedSearchQuery) {
      const typedKey = key as SearchableKey;
      const queryValues = decodedSearchQuery[typedKey];
      if (!queryValues) continue;

      resultData = resultData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
    }
  } catch (e) {
    console.error("[error:getMangaList]metadataの取得に失敗しました");
    res.status(500).json({error:"漫画情報の取得に失敗しました"});
  }

  //ページに切り取り
  const mangaListPageData = resultData.slice(startIndex, endIndex);

  res.status(200).json({ page, limit, total: resultData.length, data: mangaListPageData });
};
