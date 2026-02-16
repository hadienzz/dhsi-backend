import prisma from "../../database/prisma";
import { APIError } from "../../middleware/error.middleware";
import { BuyWorkshopWithCreditsPayload } from "../../types/types";
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
    throw new APIError(
      "Anda harus membeli workshop ini terlebih dahulu.",
      403,
    );
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

export const workshopService = {
  softDeleteWorkshop,
  buyWorkshopWithCredits,
  toggleModuleProgress,
};
