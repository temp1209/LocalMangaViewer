import { SearchableKeys } from "./metadata";

export type MangaQuery = {
  search: SearchQuery;
  pageConf: {
    page?: string;
    limit?: string;
  };
};

export type RawMangaQuery = {
  search: RawSearchQuery;
  pageConf: PageConf;
}

type SearchQuery = {
  [K in SearchableKeys]: string[];
};

type RawSearchQuery = {
  [K in SearchableKeys]?: string | string[];
}

type PageConf = {
  page?: string;
  limit?: string;
}