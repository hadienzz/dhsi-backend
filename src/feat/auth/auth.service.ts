import bcrypt from "bcrypt";
import { APIError } from "../../middleware/error.middleware";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.util";
import {
  createUser,
  createVerificationCode,
  findUserByEmail,
  findValidVerificationCode,
  invalidateUserVerificationCodes,
  markUserVerified,
  markVerificationCodeUsed,
  revokeAllUserRefreshTokens,
  saveRefreshToken,
} from "./auth.repository";
import { sendVerificationEmail } from "../../utils/email.util";

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
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const issueTokensForUser = async (userId: string, email: string) => {
  const payload = { userId, email };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await revokeAllUserRefreshTokens(userId);
  await saveRefreshToken(
    userId,
    refreshToken,
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
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

// ─── Email Verification ───

export const sendVerificationCodeService = async (
  userId: string,
  email: string,
) => {
  // Invalidate all previous codes
  await invalidateUserVerificationCodes(userId);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  await createVerificationCode(userId, code, expiresAt);
  await sendVerificationEmail(email, code);
};

export const verifyCodeService = async (userId: string, code: string) => {
  const verification = await findValidVerificationCode(userId, code);

  if (!verification) {
    throw new APIError(
      "Kode verifikasi tidak valid atau sudah kedaluwarsa",
      400,
    );
  }

  await markVerificationCodeUsed(verification.id);
  await markUserVerified(userId);
};
