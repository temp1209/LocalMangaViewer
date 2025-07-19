import { z } from "zod";

export const userConfigSchema = z.object({
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
  })
});
export type UserConfig = z.infer<typeof userConfigSchema>;

export const serverConfigSchema = z.object({
  dataDirectory: z.string(),
  cache: z.object({
    enable: z.boolean(),
    size: z.number(),
  })
});
export type ServerConfig = z.infer<typeof serverConfigSchema>;