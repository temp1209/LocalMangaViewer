import { MetadataList, SearchQuery, SearchableKey } from "@comic-viewer/shared";
import { logger } from "../../utils/logger.js";

export const searchManga = (dataList: MetadataList, query: SearchQuery) => {
  logger.info("[searchManga]漫画の検索を開始しました");
  logger.info("[searchManga]総漫画数:",dataList.length);
  let resultData = dataList;
  for (const key in query) {
    const typedKey = key as SearchableKey;
    const queryValues = query[typedKey];
    if (!queryValues) continue;

    resultData = resultData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
  }
  logger.info("[searchManga]漫画の検索を終了しました");
  return resultData;
};
