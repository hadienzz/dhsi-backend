import prisma from "../../database/prisma";
import { APIError } from "../../middleware/error.middleware";
import { snap } from "../../lib/midtrans";
import { BuyWorkshopWithCreditsPayload } from "../../types/types";
import { workshopRepository } from "./workshop.repository";
import { walletRepository } from "../wallet/wallet.repository";

type SoftDeleteWorkshopInput = {
  workshopId: string;
  userId: string;
  userRole: string;
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

  // Gunakan saldo aktif (kredit yang belum kadaluarsa)
  const activeBalance = await walletRepository.getActiveBalance(payload.user_id);

  if (activeBalance < selectedWorkshop.credit_price) {
    throw new APIError("Insufficient credits", 400);
  }

  await prisma.$transaction(async (tx) => {
    // Deduct credits
    await tx.userWallet.update({
      where: { user_id: payload.user_id },
      data: {
        balance: {
          decrement: selectedWorkshop.credit_price,
        },
      },
    });

    const wallet = await tx.userWallet.findUnique({
      where: { user_id: payload.user_id },
      select: { balance: true },
    });

    await tx.creditTransaction.create({
      data: {
        user_id: payload.user_id,
        type: "PURCHASE_WORKSHOP",
        amount: selectedWorkshop.credit_price,
        balance_before: (wallet?.balance ?? 0) + selectedWorkshop.credit_price,
        balance_after: wallet?.balance ?? 0,
        description: `Pembelian workshop: ${selectedWorkshop.title}`,
        reference_id: payload.workshop_id,
      },
    });

    await tx.workshopCreditPurchase.create({
      data: {
        user_id: payload.user_id,
        workshop_id: payload.workshop_id,
        credit_used: selectedWorkshop.credit_price,
      },
    });
  });
};

export const workshopService = {
  softDeleteWorkshop,
  buyWorkshopWithCredits,
};
