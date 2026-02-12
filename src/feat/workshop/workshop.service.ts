import prisma from "../../database/prisma";
import { APIError } from "../../middleware/error.middleware";
import { snap } from "../../lib/midtrans";

type CreateWorkshopPaymentInput = {
  workshopId: string;
  userId: string;
  userEmail: string;
  userName: string;
  idempotencyKey: string;
};

type SoftDeleteWorkshopInput = {
  workshopId: string;
  userId: string;
  userRole: string;
};

const createWorkshopPayment = async (input: CreateWorkshopPaymentInput) => {
  const { workshopId, userId, userEmail, userName, idempotencyKey } = input;

  // If this idempotency key already used, return existing payment
  const existing = await prisma.workshopPayment.findUnique({
    where: { idempotency_key: idempotencyKey },
  });

  if (existing) {
    return {
      orderId: existing.order_id,
      transactionToken: existing.transaction_token,
      redirectUrl: existing.redirect_url,
      idempotencyKey: existing.idempotency_key,
    };
  }

  const workshop = await prisma.workshop.findFirst({
    where: { id: workshopId, deleted_at: null },
  });

  if (!workshop) {
    throw new APIError("Workshop not found", 404);
  }

  const amount = Number(
    typeof (workshop.price as unknown as any).toString === "function"
      ? (workshop.price as unknown as any).toString()
      : workshop.price,
  );

  const orderId = `${crypto.randomUUID()}-${Date.now()}`;

  const transactionParams: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: [
      {
        id: workshop.id,
        price: amount,
        quantity: 1,
        name: workshop.title.substring(0, 50),
      },
    ],
    enabled_payments: ["gopay"],
    customer_details: {
      email: userEmail,
      first_name: userName,
    },
  };

  const transaction = await snap.createTransaction(transactionParams);

  const payment = await prisma.packagePayment.create({
    data: {
      user_id: userId,
      workshop_id: workshop.id,
      order_id: orderId,
      transaction_token: transaction.token,
      redirect_url: transaction.redirect_url,
      amount,
      idempotency_key: idempotencyKey,
    },
  });

  return {
    orderId: payment.order_id,
    transactionToken: payment.transaction_token,
    redirectUrl: payment.redirect_url,
    idempotencyKey: payment.idempotency_key,
  };
};

const softDeleteWorkshop = async (input: SoftDeleteWorkshopInput) => {
  const { workshopId, userId, userRole } = input;

  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  });

  if (!workshop) {
    throw new APIError("Workshop not found", 404);
  }

  if (workshop.deleted_at) {
    return;
  }

  // Only admin or owner can delete
  if (userRole !== "admin" && workshop.user_id !== userId) {
    throw new APIError("Forbidden", 403);
  }

  await prisma.workshop.update({
    where: { id: workshopId },
    data: { deleted_at: new Date() },
  });
};

export const workshopService = {
  createWorkshopPayment,
  softDeleteWorkshop,
};
