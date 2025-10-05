import { searchableKeysArray } from "../constants/searchableKeys.js";
import { defaultConfig } from "../constants/defaultConfig.js";
import { z } from "zod";

export const SearchQuerySchema = z.record(z.enum(searchableKeysArray),z.array(z.string()));

export const RawSearchQuerySchema = z.record(z.enum(searchableKeysArray), z.union([z.string(), z.array(z.string())]).optional());

export const PageConfSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(defaultConfig.user.ui.pageLimit),
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