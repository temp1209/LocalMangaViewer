import { Request, Response } from "express";

import { getConfig } from "../../services/config/getConfig.js";
import { logger } from "../../utils/logger.js";

export const getConfigAPI = async (req: Request, res: Response) => {
  logger.info("[getConfig]設定取得APIにアクセスしました");
  const config = await getConfig();
  logger.info("[getConfig]設定の取得に成功しました");
  res.status(200).json(config);
  return;
};
