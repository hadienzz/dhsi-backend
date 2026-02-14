import prisma from "../../database/prisma";
import { CreateTransactionPayload } from "../../types/types";

const checkpaymentExists = async (idempotency_key: string) => {
  const isExisting = await prisma.packagePayment.findUnique({
    where: {
      idempotency_key,
    },
  });

  return isExisting;
};

const createTransaction = async (payload: CreateTransactionPayload) => {
  const transaction = await prisma.packagePayment.create({
    data: payload,
  });

  return transaction;
};

export const paymentRepository = {
  checkpaymentExists,
  createTransaction,
};
