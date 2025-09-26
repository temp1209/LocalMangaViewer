import { z } from "zod";
import {
  MangaQuerySchema,
  PageConfSchema,
  PageDataListSchema,
  PageDataSchema,
  SearchQuerySchema,
} from "../schemas/queriesSchema";

export type { SearchQuery, PageConf, MangaQuery, PageData, PageDataList };

type SearchQuery = z.infer<typeof SearchQuerySchema>;
type PageConf = z.infer<typeof PageConfSchema>;
type MangaQuery = z.infer<typeof MangaQuerySchema>;
type PageData = z.infer<typeof PageDataSchema>;
type PageDataList = z.infer<typeof PageDataListSchema>;
