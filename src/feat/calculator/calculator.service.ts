import prisma from "../../database/prisma";
import { APIError } from "../../middleware/error.middleware";
import { walletRepository } from "../wallet/wallet.repository";
import { calculatorRepository } from "./calculator.repository";

interface UseCalculatorInput {
  user_id: string;
  calculator_type: string;
}

const useCalculator = async (input: UseCalculatorInput) => {
  const { user_id, calculator_type } = input;

  const price = calculatorRepository.getCalculatorPrice(calculator_type);
  if (price === null) {
    throw new APIError("Invalid calculator type", 400);
  }

  // Check active balance (kredit yang belum kadaluarsa)
  const activeBalance = await walletRepository.getActiveBalance(user_id);
  if (activeBalance < price) {
    throw new APIError(
      "Kredit tidak cukup. Silakan top up terlebih dahulu.",
      400,
    );
  }

  // Deduct credits in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Get current wallet balance
    const wallet = await tx.userWallet.findUnique({
      where: { user_id },
      select: { balance: true },
    });

    if (!wallet) {
      throw new APIError("Wallet not found", 404);
    }

    const balanceBefore = wallet.balance;

    // Deduct from wallet
    const updatedWallet = await tx.userWallet.update({
      where: { user_id },
      data: {
        balance: { decrement: price },
      },
    });

    // Create credit transaction record
    await tx.creditTransaction.create({
      data: {
        user_id,
        type: "CALCULATOR_USAGE",
        amount: price,
        balance_before: balanceBefore,
        balance_after: updatedWallet.balance,
        description: `Penggunaan Kalkulator Waris`,
      },
    });

    // Create calculator usage record
    await tx.calculatorUsages.create({
      data: {
        user_id,
        calculator_type,
        credit_used: price,
      },
    });

    return {
      credit_used: price,
      balance_after: updatedWallet.balance,
    };
  });

  return result;
};

const getCalculatorPrice = (calculatorType: string) => {
  const price = calculatorRepository.getCalculatorPrice(calculatorType);
  return price;
};

export const calculatorService = {
  useCalculator,
  getCalculatorPrice,
};
