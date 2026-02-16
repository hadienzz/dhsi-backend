import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { validate } from "../../utils/validate.util";
import { updateProfileSchema } from "./profile.schema";
import { profileController } from "./profile.controller";

const router = Router();

router.get("/", verifyToken, profileController.getProfile);
router.patch("/", verifyToken, validate(updateProfileSchema, "body"), profileController.updateProfile);

export default router;
