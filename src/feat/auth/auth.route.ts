import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../utils/validate.util";
import { registerSchema } from "./auth.schema";

const router = Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  authController.registerUser
);

// router.post("/register");
// router.post("/logout");

export default router;
