import { MetadataList, SearchQuery, SearchableKey } from "shared";

export const searchManga = (dataList: MetadataList, query: SearchQuery) => {
  let resultData = dataList;
  for (const key in query) {
    const typedKey = key as SearchableKey;
    const queryValues = query[typedKey];
    if (!queryValues) continue;

    resultData = resultData.filter((item) => queryValues.every((v) => item[typedKey].includes(v)));
  }
  return resultData;
};
