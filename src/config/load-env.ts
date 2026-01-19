import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
}

export const envConfig: EnvConfig = {
  PORT: Number(requireEnv("PORT")),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  ACCESS_TOKEN_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("JWT_REFRESH_SECRET"),
};
