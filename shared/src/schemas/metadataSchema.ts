import { z } from "zod";
import { PageConfSchema } from "./queriesSchema.js";

export const CoverSchema = z.object({
  name: z.string(),
  isPortrait: z.boolean(),
});

export const MetadataItemSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  groups: z.array(z.string()),
  originals: z.array(z.string()),
  characters: z.array(z.string()),
  tags: z.array(z.string()),
  id: z.string().uuid(),
  cover: CoverSchema,
});

export const MetadataListSchema = z.object({
  pageConf: PageConfSchema,
  total: z.coerce.number().int().nonnegative().default(0),
  data: z.array(MetadataItemSchema).default([]),
});

//IDとcoverはクライアント側からの送信情報に含まれないようにする
//IDをフォルダ名にしているので、IDに変なものを入れられると危険なので弾く
export const MetadataUploadSchema = MetadataItemSchema.omit({ id: true, cover: true });
