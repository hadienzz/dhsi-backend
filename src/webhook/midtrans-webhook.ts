import crypto from "crypto";
import { Router, Request, Response, NextFunction } from "express";
import type { PaymentStatus, Prisma } from "../../generated/prisma/client";
import prisma from "../database/prisma";
import { envConfig } from "../config/load-env";
import { APIError } from "../middleware/error.middleware";

type MidtransNotification = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
};

const computeMidtransSignature = (input: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  server_key: string;
}) => {
  return crypto
    .createHash("sha512")
    .update(`${input.order_id}${input.status_code}${input.gross_amount}${input.server_key}`)
    .digest("hex");
};

const mapMidtransStatus = (notification: MidtransNotification): PaymentStatus => {
  const ts = (notification.transaction_status ?? "").toLowerCase();
  const fraud = (notification.fraud_status ?? "").toLowerCase();

  if (ts === "settlement") return "SETTLEMENT";
  if (ts === "capture") {
    // Credit card flow: capture + fraud_status=accept is considered settled.
    if (fraud === "accept") return "SETTLEMENT";
    return "PENDING";
  }

  if (ts === "pending") return "PENDING";
  if (ts === "cancel" || ts === "deny") return "CANCEL";
  if (ts === "expire") return "EXPIRE";

  return "PENDING";
};

const router = Router();

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = req.body as MidtransNotification;

      const order_id = notification.order_id?.trim();
      const status_code = notification.status_code?.toString().trim();
      const gross_amount = notification.gross_amount?.toString().trim();
      const signature_key = notification.signature_key?.trim();

      if (!order_id || !status_code || !gross_amount || !signature_key) {
        throw new APIError("Invalid Midtrans payload", 400);
      }

      const expected = computeMidtransSignature({
        order_id,
        status_code,
        gross_amount,
        server_key: envConfig.MIDTRANS_SERVER_KEY,
      });

      if (expected.toLowerCase() !== signature_key.toLowerCase()) {
        throw new APIError("Invalid Midtrans signature", 401);
      }

      const newStatus = mapMidtransStatus(notification);

      // Update status idempotently.
      // If this is a settlement event, also credit the user balance exactly once.
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const statusWhere =
          newStatus === "PENDING" ? { not: "PENDING" as const } : "PENDING";

        const updated = await tx.packagePayment.updateMany({
          where: {
            order_id,
            status: statusWhere,
          },
          data: {
            status: newStatus,
          },
        });

        // If order_id isn't found, we still return 200 (ack) to avoid endless retries.
        if (updated.count === 0) {
          return;
        }

        // Only credit on the first transition into SETTLEMENT.
        if (newStatus !== "SETTLEMENT") {
          return;
        }

        // Ensure we only credit once: if it was already SETTLEMENT, updateMany would be 0.
        const payment = await tx.packagePayment.findUnique({
          where: { order_id },
          include: { package: true },
        });

        if (!payment) return;

        const credits = (payment.package?.credits ?? 0) + (payment.package?.bonus ?? 0);
        if (credits <= 0) return;

        // Hitung valid_until berdasarkan validity_days dari paket
        const validityDays = payment.package?.validity_days ?? null;
        let validUntil: Date | null = null;
        if (validityDays && validityDays > 0) {
          validUntil = new Date();
          validUntil.setDate(validUntil.getDate() + validityDays);
        }

        const wallet = await tx.userWallet.upsert({
          where: { user_id: payment.user_id },
          update: {},
          create: {
            user: { connect: { id: payment.user_id } },
            balance: 0,
          },
        });

        const balance_before = wallet.balance;

        const updatedWallet = await tx.userWallet.update({
          where: { user_id: payment.user_id },
          data: { balance: { increment: credits } },
        });

        await tx.creditTransaction.create({
          data: {
            user: { connect: { id: payment.user_id } },
            type: "TOPUP",
            amount: credits,
            balance_before,
            balance_after: updatedWallet.balance,
            reference_id: payment.id,
            description: `Topup via Midtrans (${payment.order_id})`,
            valid_until: validUntil,
          },
        });
      });

      return res.status(200).json({ status: "success", message: "OK" });
    } catch (err) {
      // For Midtrans, returning non-2xx will cause retries.
      // We still surface signature/payload errors as 4xx for safety.
      return next(err);
    }
  },
);

export default router;
