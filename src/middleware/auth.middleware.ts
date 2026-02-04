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
  export interface Request {
    user?: {
      id: string;
      username: string;
      email: string;
      role: string;
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
      req.cookies?.accessToken ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : undefined);

    /**
     * =========================
     * 1. COBA ACCESS TOKEN
     * =========================
     */
    if (accessToken) {
      try {
        const accessPayload = verifyAccessToken(accessToken);

        const user = await prisma.user.findUnique({
          where: { id: accessPayload.userId },
          select: { id: true, username: true, email: true, role: true },
        });

        if (!user) {
          throw new APIError("Unauthorized", 401);
        }

        req.user = user;
        return next();
      } catch (err) {
        // kalau error SELAIN expired → langsung lanjut ke refresh
        if (!(err instanceof jwt.TokenExpiredError)) {
          throw err;
        }
      }
    }

    /**
     * =========================
     * 2. FALLBACK KE REFRESH TOKEN
     * =========================
     */
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new APIError("Unauthorized", 401);
    }

    const refreshPayload = verifyRefreshToken(refreshToken);

    const storedToken = await findRefreshToken(refreshToken);
    if (
      !storedToken ||
      storedToken.revoked_at !== null ||
      storedToken.expires_at <= new Date()
    ) {
      throw new APIError("Unauthorized", 401);
    }

    /**
     * =========================
     * 3. GENERATE ACCESS TOKEN BARU
     * =========================
     */
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

    const user = await prisma.user.findUnique({
      where: { id: refreshPayload.userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new APIError("Unauthorized", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof APIError) {
      return next(error);
    }

    console.error("Verify token error:", error);

    return next(new APIError("Authentication failed", 500));
  }
};
