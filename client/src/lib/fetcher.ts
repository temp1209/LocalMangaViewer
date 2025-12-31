import { z } from "zod";

export const safeFetchWithSchema = async <T>(url: string, schema: z.ZodType): Promise<T> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error! status:${response.status}`);
    }

    const json = await response.json();
    const result = schema.safeParse(json);
    return result.success ? result.data : schema.parse({});
  } catch (err) {
    console.error("[safeParseWithSchema] 通信もしくはパースに失敗しました:", url, err);
    return schema.parse({});
  }
};
