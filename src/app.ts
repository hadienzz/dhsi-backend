import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./feat/auth/auth.route";
import cors from "cors";
import dashboardRoutes from "./feat/dashboard/dashboard.route";
import workshopRoutes from "./feat/workshop/workshop.route";
import packetRoutes from "./feat/packet/packet.route";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/packets", packetRoutes);
// app.use("/api/workshops", workshopRoutes);

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
