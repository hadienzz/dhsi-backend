import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import { paymentService } from "./payment.service";

const createPayment = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const user_id = req.user?.id!;
    const name = req.user?.username!;
    const email = req.user?.email!;
    const { package_id } = req.body;
    const idempotency_key = req.headers["idempotency-key"] as string;

    const result = await paymentService.createPayment({
      user_id: user_id,
      package_id,
      idempotency_key,
      name,
      email,
    });

    return res.status(200).json({
      status: "success",
      message: "Payment created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const paymentController = {
  createPayment,
};
