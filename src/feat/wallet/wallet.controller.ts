import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import prisma from "../../database/prisma";
import { APIError } from "../../middleware/error.middleware";
import { walletRepository } from "./wallet.repository";

const addBalance = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const adminId = req.user.id;

    if (req.user.role !== "admin") {
      throw new APIError("Forbidden", 403);
    }

    const { user_id, credits } = req.body as {
      user_id?: string;
      credits?: unknown;
    };

    if (!user_id) {
      throw new APIError("user_id is required", 400);
    }

    const amount =
      typeof credits === "string" ? Number(credits) : (credits as number);

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) {
      throw new APIError("credits must be a positive integer", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.upsert({
        where: { user_id },
        update: {},
        create: {
          user: { connect: { id: user_id } },
          balance: 0,
        },
      });

      const balance_before = wallet.balance;

      const updatedWallet = await tx.userWallet.update({
        where: { user_id },
        data: { balance: { increment: amount } },
      });

      await tx.creditTransaction.create({
        data: {
          user: { connect: { id: user_id } },
          type: "ADJUSTMENT",
          amount,
          balance_before,
          balance_after: updatedWallet.balance,
          description: `Manual credit by admin (${adminId})`,
        },
      });

      return updatedWallet;
    });

    return res.status(200).json({
      status: "success",
      message: "Balance updated",
      data: {
        user_id,
        balance: result.balance,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMyWallet = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const user_id = req.user.id;
    const activeBalance = await walletRepository.getActiveBalance(user_id);
    const rawWallet = await walletRepository.checkBalance(user_id);

    return res.status(200).json({
      status: "success",
      message: "Wallet info retrieved",
      data: {
        total_balance: rawWallet?.balance ?? 0,
        active_balance: activeBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionHistory = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const user_id = req.user.id;
    const transactions = await walletRepository.getTransactionHistory(user_id);
    const activeBalance = await walletRepository.getActiveBalance(user_id);

    return res.status(200).json({
      status: "success",
      message: "Transaction history retrieved",
      data: {
        active_balance: activeBalance,
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const walletController = {
  addBalance,
  getMyWallet,
  getTransactionHistory,
};
