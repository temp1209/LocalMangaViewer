import { searchableKeysArray } from "../constants/searchableKeys";
import { defaultCongfig } from "../constants/defaultConfig";
import { z } from "zod";

export const SearchQuerySchema = z.record(z.enum(searchableKeysArray),z.array(z.string()));

export const RawSearchQuerySchema = z.record(z.enum(searchableKeysArray), z.union([z.string(), z.array(z.string())]).optional());

export const PageConfSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(defaultCongfig.user.ui.pageLimit),
});

export const MangaQuerySchema = z.object({
  search: SearchQuerySchema,
  pageConf: PageConfSchema,
});

export const PageDataSchema = z.object({
  pageID: z.number().positive(),
  url : z.string().url()
});

export const PageDataListSchema = z.array(PageDataSchema);

export type {
  SearchQuery,
  PageConf,
  MangaQuery,
  PageData,
  PageDataList
};

type SearchQuery = z.infer<typeof SearchQuerySchema>;
type PageConf = z.infer<typeof PageConfSchema>;
type MangaQuery = z.infer<typeof MangaQuerySchema>;
type PageData = z.infer<typeof PageDataSchema>;
type PageDataList = z.infer<typeof PageDataListSchema>;