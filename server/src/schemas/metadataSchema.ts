import { z } from "zod";

export const coverSchema = z.object({
  path: z.string(),
  isPortrait: z.boolean(),
})

export const MetadataItemSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  groups: z.array(z.string()),
  originals: z.array(z.string()),
  characters: z.array(z.string()),
  tags: z.array(z.string()),
  id: z.string(),
  cover: coverSchema,
});

export const MetadataListSchema = z.array(MetadataItemSchema);

export const RawMetadataItemSchema = MetadataItemSchema.extend({
  id:z.string().uuid().optional(),
  cover: coverSchema.optional(),
})


type MetadataItem = z.infer<typeof MetadataItemSchema>;
type MetadataList = z.infer<typeof MetadataListSchema>;
type RawMetadataItem = z.infer<typeof RawMetadataItemSchema>;

export type { MetadataList, MetadataItem, RawMetadataItem };