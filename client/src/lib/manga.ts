import { MangaQuerySchema,searchableKeysArray,PageConfSchema} from "@comic-viewer/shared";

export const getMangaQueryFromURLParam = (urlParams: URLSearchParams) => {
  const rawSearch = generateObjectFromKeyArray(urlParams,searchableKeysArray);

  //TODO: 一旦ハードコーディング
  //スキーマからオブジェクトのキーを取り出す方法を調べる
  //Zodv4でないとschema.shapeが使えない
  //非推奨になる関数もあるのでバージョンアップ要検討
  const pageConfKeyArray = ["page","limit"];
  const rawPageConf = generateObjectFromKeyArray(urlParams,pageConfKeyArray);

  const result = MangaQuerySchema.safeParse({
    search:rawSearch,
    pageConf: rawPageConf
  });

  if(!result.success){
    console.error("[getMangaQueryFromURLParam] 検索クエリのパースに失敗しました:",result.error);
    return MangaQuerySchema.parse({});
  }

  return result.data;
};

function generateObjectFromKeyArray(urlParams:URLSearchParams,keyArray:readonly string[]){
  const rawQuery:Record<string,string> = {};
  keyArray.forEach((key)=>{
    const value = urlParams.get(key);
    if(value){
      rawQuery[key] = value;
    }
  });
  return rawQuery;
}
