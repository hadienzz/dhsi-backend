import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import { packetService } from "./packet.service";

const getPackets = async(
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const packets = await packetService.getPackets();
    return res.status(200).json({
      status: "success",
      message: "Packet list",
      data: packets,
    });
  } catch (err) {
    next(err);
  }
};

export const packetController = {
  getPackets,
};
