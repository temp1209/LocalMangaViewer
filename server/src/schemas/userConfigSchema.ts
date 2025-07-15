import { z } from "zod";

export const userConfigSchema = z.object({
  dataDirectory: z.array(z.string()),
  viewer: z.object({
    pageDirection: z.enum(["right", "left"]),
    keyboardShortcuts: z.object({
      nextPage: z.array(z.string()),
      prevPage: z.array(z.string()),
    }),
  }),
  ui: z.object({
    theme: z.enum(["dark","light","auto"]),
    pageLimit: z.number().positive(),
  }),
  advanced: z.object({
    enableCache: z.boolean(),
    cacheSize: z.number(),
  })
});

export type UserConfig = z.infer<typeof userConfigSchema>;