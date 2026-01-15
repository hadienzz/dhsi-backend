import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./feat/auth/auth.route";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(errorHandler);
export default app;
