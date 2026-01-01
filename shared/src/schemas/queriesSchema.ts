import { searchableKeysArray } from "../constants/searchableKeys.js";
import { z } from "zod";
import { pageConfDefault,emptySearchQuery,mangaQueryDefault, pageDataDefault } from "../constants/schemaDefaults.js";

export const SearchQuerySchema = z
  .record(
    z.enum(searchableKeysArray),
    //文字列を文字列の配列に直す
    z.preprocess((val) => {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "string") {
        return [val];
      }
      return [];
    }, z.array(z.string()))
  )
  .default(emptySearchQuery);

export const PageConfSchema = z
  .object({
    page: z.coerce.number().positive().int().default(pageConfDefault.page),
    limit: z.coerce.number().positive().int().default(pageConfDefault.limit),
  })
  .default(pageConfDefault);

export const MangaQuerySchema = z.object({
  search: SearchQuerySchema,
  pageConf: PageConfSchema,
}).default(mangaQueryDefault);

export const PageDataSchema = z.object({
  pageID: z.number().positive().int().default(pageDataDefault.pageID),
  url: z.url().default(pageDataDefault.url),
}).default(pageDataDefault);

export const PageDataListSchema = z.array(PageDataSchema).default([]);
