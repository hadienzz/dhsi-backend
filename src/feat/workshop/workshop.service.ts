import prisma from "../../database/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { randomUUID } from "crypto";
import { snap } from "../../lib/midtrans";
import { APIError } from "../../middleware/error.middleware";
import {
  BuyWorkshopWithCreditsPayload,
  WorkshopCheckoutPayload,
  SnapTransactionPayload,
} from "../../types/types";
import { workshopRepository } from "./workshop.repository";
import { walletRepository } from "../wallet/wallet.repository";

type SoftDeleteWorkshopInput = {
  workshopId: string;
  userId: string;
  userRole: string;
};

type ToggleModuleProgressInput = {
  userId: string;
  moduleId: string;
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

const buyWorkshopWithCredits = async (
  payload: BuyWorkshopWithCreditsPayload,
) => {
  const selectedWorkshop = await workshopRepository.selectedWorkshop(
    payload.workshop_id,
  );

  if (!selectedWorkshop) {
    throw new APIError("Workshop not found", 404);
  }

  // Check if already purchased
  const alreadyOwned = await workshopRepository.checkUserOwnsWorkshop(
    payload.user_id,
    payload.workshop_id,
  );
  if (alreadyOwned) {
    throw new APIError("Anda sudah membeli workshop ini", 400);
  }

  // Gunakan saldo aktif (kredit yang belum kadaluarsa)
  const activeBalance = await walletRepository.getActiveBalance(
    payload.user_id,
  );

  if (activeBalance < selectedWorkshop.credit_price) {
    throw new APIError(
      "Kredit tidak cukup. Silakan top up terlebih dahulu.",
      400,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Get current balance
    const wallet = await tx.userWallet.findUnique({
      where: { user_id: payload.user_id },
      select: { balance: true },
    });

    if (!wallet) {
      throw new APIError("Wallet not found", 404);
    }

    const balanceBefore = wallet.balance;

    // Deduct credits
    const updatedWallet = await tx.userWallet.update({
      where: { user_id: payload.user_id },
      data: {
        balance: {
          decrement: selectedWorkshop.credit_price,
        },
      },
    });

    // Create credit transaction
    await tx.creditTransaction.create({
      data: {
        user_id: payload.user_id,
        type: "PURCHASE_WORKSHOP",
        amount: selectedWorkshop.credit_price,
        balance_before: balanceBefore,
        balance_after: updatedWallet.balance,
        description: `Pembelian workshop: ${selectedWorkshop.title}`,
        reference_id: payload.workshop_id,
      },
    });

    // Create purchase record
    await tx.workshopCreditPurchase.create({
      data: {
        user_id: payload.user_id,
        workshop_id: payload.workshop_id,
        credit_used: selectedWorkshop.credit_price,
      },
    });

    // Add to selected workshops (user now "owns" the workshop)
    await tx.selectedWorkshop.create({
      data: {
        user_id: payload.user_id,
        workshop_id: payload.workshop_id,
      },
    });

    return {
      credit_used: selectedWorkshop.credit_price,
      balance_after: updatedWallet.balance,
      workshop_title: selectedWorkshop.title,
    };
  });

  return result;
};

const toggleModuleProgress = async (input: ToggleModuleProgressInput) => {
  const { userId, moduleId } = input;

  // Verify module exists
  const module = await workshopRepository.getModuleById(moduleId);
  if (!module) {
    throw new APIError("Modul tidak ditemukan", 404);
  }

  // Verify user owns the workshop
  const isOwned = await workshopRepository.checkUserOwnsWorkshop(
    userId,
    module.workshop_id,
  );
  if (!isOwned) {
    throw new APIError("Anda harus membeli workshop ini terlebih dahulu.", 403);
  }

  // Get current progress (toggle)
  const currentProgress = await workshopRepository.getModuleProgress(
    userId,
    moduleId,
  );
  const newStatus = !currentProgress?.is_completed;

  const result = await workshopRepository.upsertModuleProgress(
    userId,
    moduleId,
    newStatus,
  );

  return {
    module_id: moduleId,
    is_completed: result.is_completed,
    completed_at: result.completed_at,
  };
};

type SubmitRatingInput = {
  userId: string;
  workshopId: string;
  rating: number;
  review: string | null;
};

const submitRating = async (input: SubmitRatingInput) => {
  const { userId, workshopId, rating, review } = input;

  // Verify workshop exists
  const workshop = await workshopRepository.selectedWorkshop(workshopId);
  if (!workshop) {
    throw new APIError("Workshop tidak ditemukan", 404);
  }

  // Verify user owns the workshop
  const isOwned = await workshopRepository.checkUserOwnsWorkshop(
    userId,
    workshopId,
  );
  if (!isOwned) {
    throw new APIError(
      "Anda harus membeli workshop ini terlebih dahulu untuk memberikan rating.",
      403,
    );
  }

  const result = await workshopRepository.createOrUpdateRating(
    userId,
    workshopId,
    rating,
    review,
  );

  return result;
};

/**
 * Checkout workshop with Midtrans (FULL_MONEY or HYBRID).
 * For HYBRID: credits are reserved (deducted) immediately; refunded on cancel/expire.
 * On settlement webhook: workshop access is granted.
 */
const checkoutWorkshop = async (payload: WorkshopCheckoutPayload) => {
  const workshop = await workshopRepository.selectedWorkshop(
    payload.workshop_id,
  );
  if (!workshop) {
    throw new APIError("Workshop tidak ditemukan", 404);
  }

  // Check if already purchased
  const alreadyOwned = await workshopRepository.checkUserOwnsWorkshop(
    payload.user_id,
    payload.workshop_id,
  );
  if (alreadyOwned) {
    throw new APIError("Anda sudah membeli workshop ini", 400);
  }

  if (workshop.price <= 0) {
    throw new APIError("Workshop ini tidak memiliki harga uang", 400);
  }

  // Calculate money amount
  let moneyAmount = workshop.price;
  let creditUsed = 0;

  if (payload.payment_method === "hybrid") {
    const creditsToUse = payload.credits_to_use ?? 0;
    if (creditsToUse <= 0) {
      throw new APIError(
        "Jumlah kredit harus lebih dari 0 untuk metode hybrid",
        400,
      );
    }
    if (creditsToUse >= workshop.credit_price) {
      throw new APIError(
        "Gunakan metode full credit jika ingin membayar seluruhnya dengan kredit",
        400,
      );
    }

    // Check active balance
    const activeBalance = await walletRepository.getActiveBalance(
      payload.user_id,
    );
    if (activeBalance < creditsToUse) {
      throw new APIError(
        `Kredit tidak cukup. Saldo aktif: ${activeBalance}, dibutuhkan: ${creditsToUse}`,
        400,
      );
    }

    // 1 credit = workshop.price / workshop.credit_price IDR
    const creditValuePerUnit = workshop.price / workshop.credit_price;
    const creditDiscount = Math.floor(creditsToUse * creditValuePerUnit);
    moneyAmount = workshop.price - creditDiscount;
    creditUsed = creditsToUse;

    if (moneyAmount <= 0) {
      throw new APIError("Jumlah pembayaran uang harus lebih dari 0", 400);
    }
  }

  const paymentMethod =
    payload.payment_method === "money"
      ? ("FULL_MONEY" as const)
      : ("HYBRID" as const);
  const order_id = `ws-${randomUUID()}`;

  // For HYBRID: reserve credits immediately in a transaction
  if (paymentMethod === "HYBRID" && creditUsed > 0) {
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.userWallet.findUnique({
        where: { user_id: payload.user_id },
        select: { balance: true },
      });
      if (!wallet) {
        throw new APIError("Wallet tidak ditemukan", 404);
      }
      const balanceBefore = wallet.balance;

      await tx.userWallet.update({
        where: { user_id: payload.user_id },
        data: { balance: { decrement: creditUsed } },
      });

      await tx.creditTransaction.create({
        data: {
          user_id: payload.user_id,
          type: "PURCHASE_WORKSHOP",
          amount: creditUsed,
          balance_before: balanceBefore,
          balance_after: balanceBefore - creditUsed,
          description: `Reservasi kredit untuk workshop: ${workshop.title} (${order_id})`,
          reference_id: payload.workshop_id,
        },
      });
    });
  }

  // Create payment record
  const payment = await workshopRepository.createOrGetPendingWorkshopPayment({
    user_id: payload.user_id,
    workshop_id: payload.workshop_id,
    order_id,
    amount: new Prisma.Decimal(moneyAmount),
    credit_used: creditUsed,
    payment_method: paymentMethod,
    idempotency_key: payload.idempotency_key,
  });

  // If Snap token already exists, return it
  if (payment.transaction_token) {
    return {
      order_id: payment.order_id,
      transaction_token: payment.transaction_token,
      idempotency_key: payment.idempotency_key,
    };
  }

  // Claim Snap request
  const claimed = await workshopRepository.tryStartWorkshopSnapRequest(
    payment.id,
  );
  if (!claimed) {
    const latest = await workshopRepository.getWorkshopPaymentById(payment.id);
    const tok = latest?.transaction_token ?? payment.transaction_token;
    return {
      order_id: payment.order_id,
      transaction_token: tok,
      idempotency_key: payment.idempotency_key,
    };
  }

  const parameter: SnapTransactionPayload = {
    transaction_details: {
      order_id: payment.order_id,
      gross_amount: moneyAmount,
    },
    item_details: [
      {
        id: workshop.id,
        name: workshop.title,
        price: moneyAmount,
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
    const transaction = await snap.createTransaction(parameter);

    const updated = await workshopRepository.markWorkshopSnapCompleted({
      paymentId: payment.id,
      transaction_token: transaction.token,
    });

    return {
      order_id: updated.order_id,
      transaction_token: updated.transaction_token,
      idempotency_key: updated.idempotency_key,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Midtrans Snap error";
    await workshopRepository.markWorkshopSnapFailed({
      paymentId: payment.id,
      error: message,
    });

    // If hybrid, refund the reserved credits
    if (paymentMethod === "HYBRID" && creditUsed > 0) {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.userWallet.findUnique({
          where: { user_id: payload.user_id },
          select: { balance: true },
        });

        if (wallet) {
          await tx.userWallet.update({
            where: { user_id: payload.user_id },
            data: { balance: { increment: creditUsed } },
          });

          await tx.creditTransaction.create({
            data: {
              user_id: payload.user_id,
              type: "REFUND",
              amount: creditUsed,
              balance_before: wallet.balance,
              balance_after: wallet.balance + creditUsed,
              description: `Refund kredit – gagal checkout workshop: ${workshop.title}`,
              reference_id: payload.workshop_id,
            },
          });
        }
      });
    }

    throw new APIError("Gagal membuat transaksi Midtrans", 500);
  }
};

export const workshopService = {
  softDeleteWorkshop,
  buyWorkshopWithCredits,
  checkoutWorkshop,
  toggleModuleProgress,
  submitRating,
};
