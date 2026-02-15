import prisma from "../../database/prisma";

/**
 * Saldo aktif = SUM(kredit yang belum kadaluarsa) - SUM(pengeluaran).
 *
 * Kredit (TOPUP, ADJUSTMENT, REFUND):
 *   – Jika valid_until IS NULL → selalu aktif
 *   – Jika valid_until > now   → masih aktif
 *   – Jika valid_until <= now  → kadaluarsa, tidak dihitung
 *
 * Debit (PURCHASE_WORKSHOP): selalu dikurangi.
 */
const getActiveBalance = async (user_id: string): Promise<number> => {
  const now = new Date();

  const transactions = await prisma.creditTransaction.findMany({
    where: { user_id },
    select: { type: true, amount: true, valid_until: true },
  });

  let activeCredits = 0;
  let totalDebits = 0;

  for (const tx of transactions) {
    if (tx.type === "PURCHASE_WORKSHOP") {
      totalDebits += tx.amount;
    } else {
      // TOPUP, ADJUSTMENT, REFUND
      const isExpired = tx.valid_until && tx.valid_until <= now;
      if (!isExpired) {
        activeCredits += tx.amount;
      }
    }
  }

  return Math.max(activeCredits - totalDebits, 0);
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
