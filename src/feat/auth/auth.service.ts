import bcrypt from "bcrypt";
import { APIError } from "../../middleware/error.middleware";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.util";
import {
  createUser,
  findUserByEmail,
  revokeAllUserRefreshTokens,
  saveRefreshToken,
} from "./auth.repository";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const issueTokensForUser = async (userId: string, email: string) => {
  const payload = { userId, email };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await revokeAllUserRefreshTokens(userId);
  await saveRefreshToken(
    userId,
    refreshToken,
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  );

  return { accessToken, refreshToken };
};

export const registerUserService = async (input: RegisterInput) => {
  const { username, email, password, phone } = input;

  const existing = await findUserByEmail(email);

  if (existing) {
    throw new APIError("User with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    username,
    email,
    password: hashedPassword,
    phone,
  });

  const tokens = await issueTokensForUser(user.id, user.email);

  const { password: _pw, ...safeUser } = user;

  return {
    user: safeUser,
    ...tokens,
  };
};

export const loginUserService = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await findUserByEmail(email);

  if (!user) {
    throw new APIError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new APIError("Invalid email or password", 401);
  }

  const tokens = await issueTokensForUser(user.id, user.email);

  const { password: _pw, ...safeUser } = user;

  return {
    user: safeUser,
    ...tokens,
  };
};
