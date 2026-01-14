import { envConfig } from "./env.config";

// src/config/jwt.config.ts
export const jwtConfig = {
  accessTokenSecret: envConfig.AccessTokenSecret,
  refreshTokenSecret: envConfig.RefreshTokenSecret,
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "7d",
};
