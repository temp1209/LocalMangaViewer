import { defaultConfig } from "./defaultConfig.js";
import { SearchableKey } from "../types/queries.js";
import { searchableKeysArray } from "./searchableKeys.js";

export const pageConfDefault = {
  page: 1,
  limit: defaultConfig.user.ui.pageLimit,
};

export const emptySearchQuery = Object.fromEntries<string[]>(searchableKeysArray.map((key) => [key, []])) as Record<
  SearchableKey,
  string[]
>;

export const mangaQueryDefault = {
  search: emptySearchQuery,
  pageConf: pageConfDefault,
};

export const pageDataDefault = {
  pageID: 1,
  url: "",
}