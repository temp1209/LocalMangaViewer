import { z } from "zod";
import { MetadataItemSchema, MetadataListSchema } from "../schemas/metadataSchema.js";

type MetadataItem = z.infer<typeof MetadataItemSchema>;
type MetadataList = z.infer<typeof MetadataListSchema>;

export type { MetadataList, MetadataItem };