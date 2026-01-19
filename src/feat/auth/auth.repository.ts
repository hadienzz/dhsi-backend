import prisma from "../../database/prisma";
import { CreateUserInput } from "../../model/auth";

export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date
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
