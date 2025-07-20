import { Request, Response } from "express";
import { RawMangaQuerySchema } from "../../schemas/queriesSchema";
import { MetadataListSchema } from "../../schemas/metadataSchema";
import { decodeQueryParamArray } from "../../utils/query";
import { paths } from "../../config/paths";
import { readJsonWithSchema } from "../../utils/readJsonWithSchema";
import { mapObjectValues } from "../../utils/mapObjectValues";
import { searchManga } from "../../services/manga/searchManga";

// Get
// クエリから検索しマンガ情報を返すAPI
export const getMangaListAPI = async (req: Request, res: Response) => {
  const resultReqParse = RawMangaQuerySchema.safeParse(req.query);
  if (!resultReqParse.success) {
    console.error(resultReqParse.error.message);
    res.status(400).json({ error: "クエリの形式が不正です" });
    return;
  }
  const query = resultReqParse.data;

  const decodedSearchQuery = mapObjectValues(query.search, decodeQueryParamArray);
  const metadataList = await readJsonWithSchema(paths.data.metadataFile, MetadataListSchema, []);
  const searchResult = searchManga(metadataList,decodedSearchQuery);

  //ページに切り取り
  const page = query.pageConf.page;
  const limit = query.pageConf.limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const mangaListPageData = searchResult.slice(startIndex, endIndex);

  res.status(200).json({ page, limit, total: searchResult.length, data: mangaListPageData });
};
