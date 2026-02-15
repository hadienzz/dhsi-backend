import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../database/prisma";
import { PaymentStatus, Prisma } from "@prisma/client";

export type CreatePendingPaymentPayload = {
  user_id: string;
  package_id: string;
  order_id: string;
  idempotency_key: string;
  amount: Decimal;
};

const getPaymentByIdempotencyKey = async (input: {
  user_id: string;
  idempotency_key: string;
}) => {
  return prisma.packagePayment.findUnique({
    where: {
      user_id_idempotency_key: {
        user_id: input.user_id,
        idempotency_key: input.idempotency_key,
      },
    },
  });
};

const createOrGetPendingPayment = async (
  payload: CreatePendingPaymentPayload,
) => {
  try {
    return await prisma.packagePayment.create({
      data: {
        user: {
          connect: {
            id: payload.user_id,
          },
        },
        package: {
          connect: {
            id: payload.package_id,
          },
        },
        order_id: payload.order_id,
        idempotency_key: payload.idempotency_key,
        amount: payload.amount,
        status: "PENDING",
        snap_request_status: "NOT_STARTED",
      },
    });
  } catch (err) {
    // If another request created it concurrently, fetch and return it
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existing = await getPaymentByIdempotencyKey({
        user_id: payload.user_id,
        idempotency_key: payload.idempotency_key,
      });
      if (existing) return existing;
    }
    throw err;
  }
};

const tryStartSnapRequest = async (paymentId: string) => {
  // Atomic claim: only one request can transition NOT_STARTED -> IN_PROGRESS
  const result = await prisma.packagePayment.updateMany({
    where: {
      id: paymentId,
      snap_request_status: "NOT_STARTED",
    },
    data: {
      snap_request_status: "IN_PROGRESS",
      snap_error: null,
    },
  });

  return result.count === 1;
};

const markSnapCompleted = async (input: {
  paymentId: string;
  transaction_token: string;
}) => {
  return prisma.packagePayment.update({
    where: { id: input.paymentId },
    data: {
      transaction_token: input.transaction_token,
      snap_request_status: "COMPLETED",
      snap_error: null,
    },
  });
};

const markSnapFailed = async (input: { paymentId: string; error: string }) => {
  return prisma.packagePayment.update({
    where: { id: input.paymentId },
    data: {
      snap_request_status: "FAILED",
      snap_error: input.error,
    },
  });
};

const getPaymentById = async (paymentId: string) => {
  return prisma.packagePayment.findUnique({
    where: { id: paymentId },
  });
};

const updateStatus = async (orderId: string, status: PaymentStatus) => {
  return prisma.packagePayment.update({
    where: { order_id: orderId },
    data: { status },
  });
};
export const paymentRepository = {
  getPaymentByIdempotencyKey,
  createOrGetPendingPayment,
  tryStartSnapRequest,
  markSnapCompleted,
  markSnapFailed,
  getPaymentById,
  updateStatus,
};
