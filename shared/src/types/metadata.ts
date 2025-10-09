import { z } from "zod";
import { MetadataItemSchema, MetadataListSchema,coverSchema } from "../schemas/metadataSchema.js";

type MetadataItem = z.infer<typeof MetadataItemSchema>;
type MetadataList = z.infer<typeof MetadataListSchema>;
type Cover = z.infer<typeof coverSchema>;

export type { MetadataList, MetadataItem, Cover };