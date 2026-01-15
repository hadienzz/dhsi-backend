import { SignOptions } from "jsonwebtoken";
import { envConfig } from "./load-env";

export const jwtConfig = {
  accessTokenSecret: envConfig.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: envConfig.REFRESH_TOKEN_SECRET,

  accessTokenExpiresIn: "15m" as SignOptions["expiresIn"],
  refreshTokenExpiresIn: "7d" as SignOptions["expiresIn"],
};
