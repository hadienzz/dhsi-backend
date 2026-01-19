import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../utils/validate.util";
import { loginSchema, registerSchema } from "./auth.schema";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  authController.registerUser
);

router.post("/login", validate(loginSchema, "body"), authController.loginUser);

router.get("/me", verifyToken, authController.me);

router.post("/logout", verifyToken, authController.logout);

export default router;
