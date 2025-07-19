import { searchableKeysArray } from "../constants/searchableKeys";
import { defaultUserCongfig } from "../constants/defaultConfig";
import { z } from "zod";

export const SearchQuerySchema = z.record(z.enum(searchableKeysArray),z.array(z.string()));

export const RawSearchQuerySchema = z.record(z.enum(searchableKeysArray), z.union([z.string(), z.array(z.string())]).optional());

export const PageConfSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(defaultUserCongfig.ui.pageLimit),
});

export const MangaQuerySchema = z.object({
  search: SearchQuerySchema,
  pageConf: PageConfSchema,
});

export const RawMangaQuerySchema = z.object({
  search: RawSearchQuerySchema,
  pageConf: PageConfSchema, 
});


export type {
  RawSearchQuery,
  SearchQuery,
  PageConf,
  MangaQuery,
  RawMangaQuery
};

type RawSearchQuery = z.infer<typeof RawSearchQuerySchema>;
type SearchQuery = z.infer<typeof SearchQuerySchema>;
type PageConf = z.infer<typeof PageConfSchema>;
type MangaQuery = z.infer<typeof MangaQuerySchema>;
type RawMangaQuery = z.infer<typeof RawMangaQuerySchema>;