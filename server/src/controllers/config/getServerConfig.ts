import { Request, Response } from "express";

import { getServerConfig } from "../../services/config/getServerConfig";

export const getServerConfigAPI = async (req:Request,res:Response) => {
  const config = await getServerConfig();
  res.status(200).json(config);
  return;
};
