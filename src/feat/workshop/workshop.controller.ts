import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../../utils/response.util";
import { workshopService } from "./workshop.service";
import crypto from "crypto";

export const createWorkshopPayment = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.id as string;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const rawKey =
      (req.header("Idempotency-Key") as string | undefined) ??
      crypto.randomUUID();

    const result = await workshopService.createWorkshopPayment({
      workshopId,
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      idempotencyKey: rawKey,
    });

    return res.status(201).json({
      status: "success",
      message: "Workshop checkout created successfully",
      data: {
        order_id: result.orderId,
        transaction_token: result.transactionToken,
        redirect_url: result.redirectUrl,
        idempotency_key: result.idempotencyKey,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkshop = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.workshopId as string;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await workshopService.softDeleteWorkshop({
      workshopId,
      userId: user.id,
      userRole: user.role,
    });

    return res.status(200).json({
      status: "success",
      message: "Workshop deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const workshopController = {
  createWorkshopPayment,
  deleteWorkshop,
};
