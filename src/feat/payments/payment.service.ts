import { randomUUID } from "crypto";
import { snap } from "../../lib/midtrans";
import { PaymentPayload, SnapTransactionPayload } from "../../types/types";
import { packetRepository } from "../packet/packet.repository";
import { paymentRepository } from "./payment.repository";
import { Prisma } from "../../../generated/prisma/client";

export type CreatePaymentResponseDTO = {
  order_id: string;
  transaction_token: string | null;
  idempotency_key: string;
};

const toPaymentResponse = (payment: {
  order_id: string;
  transaction_token: string | null;
  idempotency_key: string;
}): CreatePaymentResponseDTO => {
  return {
    order_id: payment.order_id,
    transaction_token: payment.transaction_token,
    idempotency_key: payment.idempotency_key,
  };
};

const createPayment = async (payload: PaymentPayload) => {

  console.log(payload)
  const packet = await packetRepository.getPacketById(payload.package_id);
  const amount = Prisma.Decimal(packet?.price || 0);

  const order_id = `payment-${randomUUID()}`;

  // 1) Create payment record FIRST (or fetch existing) under a DB unique constraint.
  //    This avoids any check-then-insert race condition.
  const payment = await paymentRepository.createOrGetPendingPayment({
    user_id: payload.user_id,
    package_id: payload.package_id,
    order_id,
    idempotency_key: payload.idempotency_key,
    amount,
  });

  // 2) If Snap token already exists (duplicate request), return existing transaction.
  if (payment.transaction_token) {
    return toPaymentResponse(payment);
  }

  // 3) Ensure Midtrans API is called only once by atomically claiming the request.
  const claimed = await paymentRepository.tryStartSnapRequest(payment.id);
  if (!claimed) {
    // Another concurrent request is already creating the Snap transaction.
    // Return whatever we have; client may retry with the same idempotency key.
    const latest = await paymentRepository.getPaymentById(payment.id);
    if (!latest) return toPaymentResponse(payment);
    return toPaymentResponse(latest);
  }

  const parameter: SnapTransactionPayload = {
    transaction_details: {
      order_id: payment.order_id,
      gross_amount: amount.toNumber(),
    },
    item_details: [
      {
        id: packet?.id!,
        name: packet?.name!,
        price: amount.toNumber(),
        quantity: 1,
      },
    ],
    enabled_payments: ["gopay"],
    customer_details: {
      email: payload.email,
      name: payload.name,
    },
  };

  try {
    // 4) External call happens AFTER DB insert and only for the claimed request.
    const transaction = await snap.createTransaction(parameter);

    const updated = await paymentRepository.markSnapCompleted({
      paymentId: payment.id,
      transaction_token: transaction.token,
    });

    return toPaymentResponse(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Midtrans Snap error";
    await paymentRepository.markSnapFailed({
      paymentId: payment.id,
      error: message,
    });

    // Production-safe behavior: we persist the failure and do NOT retry
    // with the same idempotency key to avoid creating multiple external transactions.
    const latest = await paymentRepository.getPaymentById(payment.id);
    if (latest) return toPaymentResponse(latest);
    return toPaymentResponse(payment);
  }
};

export const paymentService = {
  createPayment,
};
