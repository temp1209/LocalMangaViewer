import { Request, Response } from "express";

import { getConfig } from "../../services/config/getConfig";

export const getConfigAPI = async (req: Request, res: Response) => {
  const config = await getConfig();
  res.status(200).json(config);
  return;
};
