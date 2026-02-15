import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { walletController } from "./wallet.controller";

const router = Router();

router.post("/add-balance", verifyToken, walletController.addBalance);
router.get("/me", verifyToken, walletController.getMyWallet);
router.get("/transactions", verifyToken, walletController.getTransactionHistory);

export default router;