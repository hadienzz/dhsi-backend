import prisma from "../../database/prisma";

/**
 * Saldo aktif = UserWallet.balance, setelah expired credits di-deduct.
 *
 * Sebelum mengembalikan balance, fungsi ini:
 * 1. Cari semua kredit (TOPUP, ADJUSTMENT, REFUND) yang sudah expired
 *    (valid_until <= now) tapi belum pernah di-deduct (expired_deducted = false).
 * 2. Kurangi amount-nya dari UserWallet.balance.
 * 3. Tandai sebagai expired_deducted = true agar tidak di-deduct lagi.
 *
 * Hasil akhir: UserWallet.balance selalu mencerminkan saldo yang valid.
 */
const getActiveBalance = async (user_id: string): Promise<number> => {
  const now = new Date();

  // Find newly expired credits that haven't been deducted yet
  const expiredCredits = await prisma.creditTransaction.findMany({
    where: {
      user_id,
      type: { in: ["TOPUP", "ADJUSTMENT", "REFUND"] },
      valid_until: { lte: now },
      expired_deducted: false,
    },
    select: { id: true, amount: true },
  });

  if (expiredCredits.length > 0) {
    const totalExpired = expiredCredits.reduce((sum, tx) => sum + tx.amount, 0);
    const expiredIds = expiredCredits.map((tx) => tx.id);

    // Atomic: deduct expired amount from wallet + mark transactions as deducted
    await prisma.$transaction(async (tx) => {
      await tx.userWallet.update({
        where: { user_id },
        data: { balance: { decrement: totalExpired } },
      });

      await tx.creditTransaction.updateMany({
        where: { id: { in: expiredIds } },
        data: { expired_deducted: true },
      });
    });
  }

  // Now just read the clean balance
  const wallet = await prisma.userWallet.findUnique({
    where: { user_id },
    select: { balance: true },
  });

  return Math.max(wallet?.balance ?? 0, 0);
};

const checkBalance = async (user_id: string) => {
  const wallet = await prisma.userWallet.findUnique({
    where: { user_id },
    select: { balance: true },
  });
  return wallet;
};

const getTransactionHistory = async (user_id: string) => {
  return prisma.creditTransaction.findMany({
    where: { user_id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      type: true,
      amount: true,
      balance_before: true,
      balance_after: true,
      description: true,
      valid_until: true,
      created_at: true,
      reference_id: true,
    },
  });
};

export const walletRepository = {
  checkBalance,
  getActiveBalance,
  getTransactionHistory,
};
