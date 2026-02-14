import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create-payment", verifyToken, paymentController.createPayment);

export default router;
