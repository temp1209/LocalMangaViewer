import { z } from "zod";

export const userConfigSchema = z.object({
  dataDirectory: z.string(),
  viewer: z.object({
    pageDirection: z.enum(["right", "left"]), // 右矢印で次のページか左矢印で次のページか
    keyboardShortcuts: z.object({
      nextPage: z.array(z.string()),
      prevPage: z.array(z.string()),
    }),
  }),
  ui: z.object({
    theme: z.enum(["dark","light","auto"]),
    pageLimit: z.number(),
  }).optional(),
  advanced: z.object({
    enableCache: z.boolean(),
    cacheSize: z.number(),
  }).optional()
});

export type UserConfig = z.infer<typeof userConfigSchema>;
