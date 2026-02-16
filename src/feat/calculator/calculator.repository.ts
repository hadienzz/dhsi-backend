import prisma from "../../database/prisma";

const CALCULATOR_PRICES: Record<string, number> = {
  waris: 10,
};

const getCalculatorPrice = (calculatorType: string): number | null => {
  return CALCULATOR_PRICES[calculatorType] ?? null;
};

const createCalculatorUsage = async (
  userId: string,
  calculatorType: string,
  creditUsed: number,
) => {
  return prisma.calculatorUsages.create({
    data: {
      user_id: userId,
      calculator_type: calculatorType,
      credit_used: creditUsed,
    },
  });
};

export const calculatorRepository = {
  getCalculatorPrice,
  createCalculatorUsage,
};
