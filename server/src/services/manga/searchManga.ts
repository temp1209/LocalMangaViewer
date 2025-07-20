import { MetadataList } from "../../schemas/metadataSchema"
import { SearchQuery } from "../../schemas/queriesSchema"
import { SearchableKey } from "../../types/SearchableKey";

export const searchManga = (dataList:MetadataList,query:SearchQuery) => {
  let resultData = dataList;
  for (const key in query) {
    const typedKey = key as SearchableKey;
    const queryValues = query[typedKey];
    if (!queryValues) continue;

    resultData = resultData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
  }
  return resultData;
}