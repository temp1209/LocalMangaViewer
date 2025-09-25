import { Request, Response } from "express";

import { setConfig } from "../../services/config/setConfig";
import { configSchema } from "../../schemas/configSchema";

export const setConfigAPI = async (req: Request, res: Response) => {
  const parse = configSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid user config" });
    return;
  }
  const ok = await setConfig(parse.data);
  if (!ok) {
    res.status(500).json({ message: "Failed to write config" });
    return;
  }
  res.status(200).json({ success: true });
  return;
};
