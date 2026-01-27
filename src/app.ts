import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./feat/auth/auth.route";
import workshopRoutes from "./feat/workshop/workshop.route";
import cors from "cors";

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
app.use("/api/workshop", workshopRoutes);

app.use(errorHandler);

export default app;
