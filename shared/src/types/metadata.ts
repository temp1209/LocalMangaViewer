import { z } from "zod";
import { MetadataItemSchema, MetadataListSchema,CoverSchema,MetadataUploadSchema } from "../schemas/metadataSchema.js";

type MetadataItem = z.infer<typeof MetadataItemSchema>;
type MetadataList = z.infer<typeof MetadataListSchema>;
type Cover = z.infer<typeof CoverSchema>;
type MetadataUpload = z.infer<typeof MetadataUploadSchema>;

export type { MetadataList, MetadataItem, Cover, MetadataUpload };