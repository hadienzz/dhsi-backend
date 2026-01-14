// src/utils/token.util.ts
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";

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
