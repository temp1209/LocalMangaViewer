import { z } from "zod";
import { defaultConfig } from "../constants/defaultConfig.js";

const userConfigSchema = z.object({
  viewer: z.object({
    pageDirection: z.enum(["right", "left"]),
    keyboardShortcuts: z.object({
      right: z.array(z.string()),
      left: z.array(z.string()),
    }),
  }),
  ui: z.object({
    theme: z.enum(["dark","light","auto"]),
    pageLimit: z.number().positive(),
  })
});

const serverConfigSchema = z.object({
  dataDirectory: z.string()
});

export const configSchema = z.object({
  user:userConfigSchema,
  server:serverConfigSchema
}).default(defaultConfig);