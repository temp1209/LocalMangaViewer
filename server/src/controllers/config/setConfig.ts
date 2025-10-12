import { Request, Response } from "express";

import { setConfig } from "../../services/config/setConfig.js";
import { configSchema } from "@comic-viewer/shared";
import { logger } from "../../utils/logger.js";

export const setConfigAPI = async (req: Request, res: Response) => {
  logger.info("[setConfig]設定保存APIにアクセスしました");
  const parse = configSchema.safeParse(req.body);
  if (!parse.success) {
    logger.error("[setConfig]新しい設定の形式が不正です");
    res.status(400).json({ message: "設定の形式が不正です" });
    return;
  }
  const ok = await setConfig(parse.data);
  if (!ok) {
    logger.error("[setConfig]設定の書き込みに失敗しました");
    res.status(500).json({ message: "設定の書き込みに失敗しました" });
    return;
  }
  logger.info("[setConfig]設定の書き込みに成功しました");
  res.status(200).json({ success: true });
  return;
};
