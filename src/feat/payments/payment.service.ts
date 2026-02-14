import { snap } from "../../lib/midtrans";
import { PaymentPayload, SnapTransactionPayload } from "../../types/types";
import { packetRepository } from "../packet/packet.repository";
import { paymentRepository } from "./payment.repository";

const createPayment = async (payload: PaymentPayload) => {
  const existing = await paymentRepository.checkpaymentExists(
    payload.idempotency_key,
  );

  if (existing) {
    return {
      orderId: existing.order_id,
      transactionToken: existing.transaction_token,
      idempotencyKey: existing.idempotency_key,
    };
  }

  const packet = await packetRepository.getPacketById(payload.package_id);
  const order_id = `payment-${Date.now()}`;

  const parameter: SnapTransactionPayload = {
    transaction_details: {
      order_id,
      gross_amount: Number(packet?.price),
    },
    item_details: [
      {
        id: packet?.id!,
        name: packet?.name!,
        price: Number(packet?.price),
        quantity: 1,
      },
    ],
    enabled_payments: ["gopay"],
    customer_details: {
      email: payload.email,
      name: payload.name,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  await paymentRepository.createTransaction({
    amount: Number(packet?.price),
    order_id,
    package_id: payload.package_id,
    user_id: payload.user_id,
    idempotency_key: payload.idempotency_key,
    status: "PENDING",
    transaction_token: transaction.token,
  });

  return transaction;
};

export const paymentService = {
  createPayment,
};
