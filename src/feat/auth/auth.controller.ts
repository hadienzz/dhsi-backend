import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import z from "zod";
import { loginSchema, registerSchema } from "./auth.schema";
import { clearAuthCookies, setAuthCookies } from "../../utils/token.util";
import { loginUserService, registerUserService } from "./auth.service";
import { revokeRefreshToken } from "./auth.repository";

const registerUser = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    const { email, username, password, phone } = req.body as z.infer<
      typeof registerSchema
    >;
    
    const { user, accessToken, refreshToken } = await registerUserService({
      email,
      username,
      password,
      phone,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const { user, accessToken, refreshToken } = await loginUserService({
      email,
      password,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const me = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Current user",
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken).catch(() => undefined);
    }

    clearAuthCookies(res);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerUser,
  loginUser,
  me,
  logout,
};
