import { z } from "zod";
import { configSchema } from "../schemas/configSchema.js";

export type Config = z.infer<typeof configSchema>;