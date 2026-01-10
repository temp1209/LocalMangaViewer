import {
  MangaQuerySchema,
  searchableKeysArray,
  PageConfSchema,
  SearchQuery,
  SearchableKey,
  PageConf,
} from "@comic-viewer/shared";

export const getMangaQueryFromURLParam = (urlParams: URLSearchParams) => {
  const keywords = urlParams.get("q");
  const rawSearch = getSearchQueryFromKeywords(keywords);

  const pageConfKeyArray = Object.keys(PageConfSchema.parse(undefined));
  const rawPageConf = generateObjectFromKeyArray(urlParams, pageConfKeyArray);

  const result = MangaQuerySchema.safeParse({
    search: rawSearch,
    pageConf: rawPageConf,
  });

  if (!result.success) {
    console.error("[getMangaQueryFromURLParam] 検索クエリのパースに失敗しました:", result.error);
    return MangaQuerySchema.parse({});
  }

  return result.data;
};

function generateObjectFromKeyArray(urlParams: URLSearchParams, keyArray: readonly string[]) {
  const rawQuery: Record<string, string> = {};
  keyArray.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      rawQuery[key] = value;
    }
  });
  return rawQuery;
}

/**
 * ユーザーが入力した文字列を検索用APIクエリに変換する関数
 * @param rawInput - ユーザー入力文字列
 */
function getSearchQueryFromKeywords(rawInput: string | null): SearchQuery {
  // 全てのキーを空配列で初期化
  const result: SearchQuery = {
    authors: [],
    groups: [],
    originals: [],
    characters: [],
    tags: [],
  };

  if (!rawInput || !rawInput.trim()) return result;

  const keywords = rawInput.split(/\s+/);
  keywords.forEach((word) => {
    const colonIndex = word.indexOf(":");

    if (colonIndex !== -1) {
      const key = (word.substring(0, colonIndex) + "s") as SearchableKey;
      const value = word.substring(colonIndex + 1);

      // keyが定義済みの検索可能キーに含まれているかチェック
      if (searchableKeysArray.includes(key) && value) {
        result[key].push(value);
        return;
      }
    }

    // プレフィックスがない、または不正なキーの場合はデフォルトで "tags" に分類
    if (word) {
      result.tags.push(word);
    }
  });

  return result;
}

export const getPagination = (pageConf:PageConf, paginationLimit: number, totalItem: number) => {
  const totalPages = Math.ceil(totalItem / pageConf.limit);
  const paginationSide = (paginationLimit - 1) / 2;

  const pageLength = Math.min(paginationLimit, totalPages);
  let startpage = pageConf.page - paginationSide;
  if (startpage < 1) {
    startpage = 1;
  }
  if (startpage + paginationLimit - 1 > totalPages) {
    startpage = Math.max(1, totalPages - pageLength + 1);
  }

  const pages = Array.from({ length: pageLength }, (_, i) => i + startpage);
  return pages;
};
