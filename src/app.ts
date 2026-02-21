import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./feat/auth/auth.route";
import dashboardRoutes from "./feat/dashboard/dashboard.route";
import workshopRoutes from "./feat/workshop/workshop.route";
import packetRoutes from "./feat/packet/packet.route";
import paymentRoutes from "./feat/payments/payment.route";
import handleWebhook from "./webhook/midtrans-webhook";
import walletRoutes from "./feat/wallet/wallet.route";
import paralegalRoute from "./feat/paralegal/paralegal.route";
import keanggotaanRoute from "./feat/keanggotaan/keanggotaan.route";
import advokatRoute from "./feat/advokat/advokat.route";
import profileRoutes from "./feat/profile/profile.route";
import calculatorRoutes from "./feat/calculator/calculator.route";
import pesertaPelatihanRoute from "./feat/peserta-pelatihan/peserta-pelatihan.route";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://dewanhukumsiber.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/packets", packetRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/calculator", calculatorRoutes);
app.use("/api/paralegal", paralegalRoute);
app.use("/api/keanggotaan", keanggotaanRoute);
app.use("/api/advokat", advokatRoute);
app.use("/api/profile", profileRoutes);
app.use("/api/peserta-pelatihan", pesertaPelatihanRoute);

app.use("/api/webhook/midtrans", handleWebhook);
app.get("/api/health", (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "API is healthy",
    });
  } catch (err) {
    next(err as Error);
  }
});

app.use(errorHandler);

export default app;
