import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  AccessTokenSecret: string;
  RefreshTokenSecret: string;
}

const loadEnv = (): EnvConfig => {
  const port = Number(process.env.PORT);
  const databaseUrl = process.env.DATABASE_URL;
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

  return {
    PORT: port,
    DATABASE_URL: databaseUrl || "",
    AccessTokenSecret: accessTokenSecret as string,
    RefreshTokenSecret: refreshTokenSecret as string,
  };
};

export const envConfig = loadEnv();
