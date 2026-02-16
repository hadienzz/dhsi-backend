import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../../utils/response.util";
import { APIError } from "../../middleware/error.middleware";
import { calculatorService } from "./calculator.service";

const useCalculator = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const { calculator_type } = req.body as { calculator_type?: string };

    if (!calculator_type) {
      throw new APIError("calculator_type is required", 400);
    }

    const result = await calculatorService.useCalculator({
      user_id: req.user.id,
      calculator_type,
    });

    return res.status(200).json({
      status: "success",
      message: "Calculator credit deducted",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getPrice = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const type = req.params.type as string;
    const price = calculatorService.getCalculatorPrice(type);

    if (price === null) {
      throw new APIError("Invalid calculator type", 400);
    }

    return res.status(200).json({
      status: "success",
      message: "Calculator price retrieved",
      data: { calculator_type: type, credit_price: price },
    });
  } catch (err) {
    next(err);
  }
};

export const calculatorController = {
  useCalculator,
  getPrice,
};
