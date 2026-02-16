import prisma from "../../database/prisma";
import { CreateUserInput } from "../../model/auth";

export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date,
) => {
  return prisma.refreshToken.create({
    data: {
      user_id: userId,
      token,
      expires_at: expiresAt,
    },
  });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
};

export const revokeRefreshToken = async (token: string) => {
  return prisma.refreshToken.update({
    where: { token },
    data: { revoked_at: new Date() },
  });
};

export const revokeAllUserRefreshTokens = async (userId: string) => {
  return prisma.refreshToken.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (input: CreateUserInput) => {
  return prisma.user.create({
    data: input,
  });
};

// ─── Email Verification ───

export const createVerificationCode = async (
  userId: string,
  code: string,
  expiresAt: Date,
) => {
  return prisma.emailVerification.create({
    data: {
      user_id: userId,
      code,
      expires_at: expiresAt,
    },
  });
};

export const findValidVerificationCode = async (
  userId: string,
  code: string,
) => {
  return prisma.emailVerification.findFirst({
    where: {
      user_id: userId,
      code,
      used_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
  });
};

export const markVerificationCodeUsed = async (id: string) => {
  return prisma.emailVerification.update({
    where: { id },
    data: { used_at: new Date() },
  });
};

export const markUserVerified = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { is_verified: true },
  });
};

export const invalidateUserVerificationCodes = async (userId: string) => {
  return prisma.emailVerification.updateMany({
    where: { user_id: userId, used_at: null },
    data: { used_at: new Date() },
  });
};
