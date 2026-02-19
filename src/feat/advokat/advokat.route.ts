import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { advokatController } from "./advokat.controller";
import upload from "../../config/multer.config";

const router = Router();

// Public
router.get("/get", advokatController.getAll);

// Admin only
router.post(
  "/create",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "foto", maxCount: 1 }]),
  advokatController.create,
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "foto", maxCount: 1 }]),
  advokatController.update,
);

router.delete("/:id", verifyToken, isAdmin, advokatController.deleteById);

export default router;
