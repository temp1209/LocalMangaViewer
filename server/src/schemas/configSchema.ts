import { z } from "zod";

const userConfigSchema = z.object({
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
type UserConfig = z.infer<typeof userConfigSchema>;

const serverConfigSchema = z.object({
  dataDirectory: z.string(),
  cache: z.object({
    enable: z.boolean(),
    size: z.number(),
  })
});
type ServerConfig = z.infer<typeof serverConfigSchema>;

export const configSchema = z.object({
  user:userConfigSchema,
  server:serverConfigSchema
});

export type Config = z.infer<typeof configSchema>;