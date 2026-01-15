import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma";
import { APIError } from "./error.middleware";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token.util";
import { APIResponse } from "../utils/response.util";
import { findRefreshToken } from "../feat/auth/auth.repository";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      username: string;
      email: string;
    };
  }
}

export const verifyToken = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      (req.headers["authorization"]?.toString().startsWith("Bearer ")
        ? req.headers["authorization"]!.toString().slice(7)
        : undefined);

    if (!accessToken) {
      throw new APIError("Unauthorized", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (err) {
      // Jika access token expired, coba pakai refresh token
      if (err instanceof jwt.TokenExpiredError) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new APIError("Unauthorized", 401);
        }

        // Verifikasi JWT refresh token
        const refreshPayload = verifyRefreshToken(refreshToken);

        // Pastikan refresh token masih valid di DB dan belum direvoke/expired
        const stored = await findRefreshToken(refreshToken);
        if (
          !stored ||
          stored.revoked_at !== null ||
          stored.expires_at <= new Date()
        ) {
          throw new APIError("Unauthorized", 401);
        }

        // Generate access token baru dan set ke cookie
        const newAccessToken = generateAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
        });

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
          path: "/",
        });

        payload = refreshPayload;
      } else {
        // Error lain -> unauthorized
        throw new APIError("Unauthorized", 401);
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw new APIError("Unauthorized", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof APIError) {
      return next(error);
    }

    return next(new APIError("Unauthorized", 401));
  }
};
