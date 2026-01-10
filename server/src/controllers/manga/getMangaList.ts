import { Request, Response } from "express";
import { MangaQuerySchema, MetadataListSchema, MetadataResponse, MetadataResponseSchema } from "@comic-viewer/shared";
import { decodeQueryParamArray } from "../../utils/query.js";
import { paths } from "../../config/paths.js";
import { readJsonWithSchemaSafe } from "../../utils/readJsonWithSchema.js";
import { mapObjectValues } from "../../utils/mapObjectValues.js";
import { searchManga } from "../../services/manga/searchManga.js";
import { logger } from "../../utils/logger.js";

// Get
// クエリから検索しマンガ情報を返すAPI
export const getMangaListAPI = async (req: Request, res: Response) => {
  logger.info("[getMangaList]漫画一覧取得APIにアクセスしました");
  logger.log("[getMangaList]受信したクエリ:", req.query);

  const resultReqParse = MangaQuerySchema.safeParse(req.query);
  if (!resultReqParse.success) {
    logger.error(`[getMangaList]漫画検索クエリパースエラー:${resultReqParse.error.message}`);
    res.status(400).json({ error: "クエリの形式が不正です" });
    return;
  }
  const query = resultReqParse.data;

  const decodedSearchQuery = mapObjectValues(query.search, decodeQueryParamArray);
  const metadataList = await readJsonWithSchemaSafe(paths.data.metadataFile, MetadataListSchema);
  const searchResult = searchManga(metadataList, decodedSearchQuery);

  //ページに切り取り
  const page = query.pageConf.page;
  const limit = query.pageConf.limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const mangaListPageData = searchResult.slice(startIndex, endIndex);

  logger.info("[getMangaList]漫画リストを取得しました");
  logger.log(`[getMangaList]漫画総数:${metadataList.length},ヒット件数:${searchResult.length}`);

  const responseData: MetadataResponse = {
    pageConf: query.pageConf,
    total: searchResult.length,
    data: mangaListPageData,
  };

  res.status(200).json(responseData);
};
