import { z } from "zod";

// MetadataItem に対応する Zod スキーマ
export const MetadataItemSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  groups: z.array(z.string()),
  originals: z.array(z.string()),
  characters: z.array(z.string()),
  tags: z.array(z.string()),
  id: z.string(),
  cover: z
    .object({
      path: z.string(),
      isPortrait: z.boolean(),
    })
    .optional(),
});

export const MetadataSchema = z.array(MetadataItemSchema);

export const SearchableKeysSchema = z.enum(["authors", "groups", "originals", "characters", "tags"]);

export type MetadataItem = z.infer<typeof MetadataItemSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type SearchableKeys = z.infer<typeof SearchableKeysSchema>;