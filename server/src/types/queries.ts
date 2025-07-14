import { SearchableKeysSchema } from "./metadata";
import { z } from "zod";

const searchableKeys = SearchableKeysSchema.options;

const SearchQuerySchema = z.record(z.enum(searchableKeys),z.array(z.string()));

const RawSearchQuerySchema = z.record(z.enum(searchableKeys), z.union([z.string(), z.array(z.string())]).optional());

const PageConfSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const MangaQuerySchema = z.object({
  search: SearchQuerySchema,
  pageConf: PageConfSchema,
});

export const RawMangaQuerySchema = z.object({
  search: RawSearchQuerySchema,
  pageConf: PageConfSchema, 
});

export type RawSearchQuery = z.infer<typeof RawSearchQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type PageConf = z.infer<typeof PageConfSchema>;
export type MangaQuery = z.infer<typeof MangaQuerySchema>;
export type RawMangaQuery = z.infer<typeof RawMangaQuerySchema>;