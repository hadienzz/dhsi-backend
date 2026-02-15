import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import { paralegalService } from "./paralegal.service";

const getParalegalData = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const paralegalData = await paralegalService.getParalegalData();
    return res.status(200).json({
      status: "success",
      message: "Data paralegal berhasil diambil",
      data: paralegalData,
    });
  } catch (err) {
    next(err);
  }
};

export const paralegalController = {
  getParalegalData,
};
