import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import z from "zod";
import { registerSchema } from "./auth.schema";

const registerUser = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    const { email, name, password } = req.body as z.infer<
      typeof registerSchema
    >;

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerUser,
};
