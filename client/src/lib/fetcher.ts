import { z } from "zod";

export const safeFetchWithSchema = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  console.log("[safeParseWithSchema] フェッチ開始");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error! status:${response.status}`);
    }

    const json = await response.json();
    const result = schema.safeParse(json);

    if (!result.success) {
      console.error("バリデーションエラー:", result.error.issues);
      throw new Error("パースに失敗しました");
    }
    console.log("[safeParseWithSchema] フェッチ終了\nResponse:",result.data);
    return result.data;
  } catch (err) {
    console.error("[safeParseWithSchema] 通信もしくはパースに失敗しました:", url, err);
    return schema.parse({});
  }
};
