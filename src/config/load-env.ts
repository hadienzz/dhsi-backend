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
  MIDTRANS_SERVER_KEY: string;
  MIDTRANS_CLIENT_KEY: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
}

export const envConfig: EnvConfig = {
  PORT: Number(requireEnv("PORT")),
  DATABASE_SESSION_POOLER: requireEnv("DATABASE_SESSION_POOLER"),
  ACCESS_TOKEN_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  DATABASE_DIRECT_URL: requireEnv("DATABASE_DIRECT_URL"),
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("SUPABASE_ANON_KEY"),
  MIDTRANS_SERVER_KEY: requireEnv("MIDTRANS_SERVER_KEY"),
  MIDTRANS_CLIENT_KEY: requireEnv("MIDTRANS_CLIENT_KEY"),
  SMTP_HOST: requireEnv("SMTP_HOST"),
  SMTP_PORT: Number(requireEnv("SMTP_PORT")),
  SMTP_USER: requireEnv("SMTP_USER"),
  SMTP_PASS: requireEnv("SMTP_PASS"),
  SMTP_FROM: requireEnv("SMTP_FROM"),
};
