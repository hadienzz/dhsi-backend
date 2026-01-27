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
  DATABASE_SESSION_POOLER: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  DATABASE_DIRECT_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const envConfig: EnvConfig = {
  PORT: Number(requireEnv("PORT")),
  DATABASE_SESSION_POOLER: requireEnv("DATABASE_SESSION_POOLER"),
  ACCESS_TOKEN_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  DATABASE_DIRECT_URL: requireEnv("DATABASE_DIRECT_URL"),
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
};