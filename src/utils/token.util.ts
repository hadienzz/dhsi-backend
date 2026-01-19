// src/utils/token.util.ts
import jwt from "jsonwebtoken";
import { Response } from "express";
import { jwtConfig } from "../config/jwt.config,";

const isProduction = process.env.NODE_ENV === "production";

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiresIn,
  });

export const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiresIn,
  });

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, jwtConfig.refreshTokenSecret) as JwtPayload;

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  // Access token: short-lived (~15m)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  // Refresh token: longer-lived (~7d)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
};
