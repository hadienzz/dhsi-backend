import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { calculatorController } from "./calculator.controller";

const router = Router();

router.post("/use", verifyToken, calculatorController.useCalculator);
router.get("/price/:type", verifyToken, calculatorController.getPrice);

export default router;
