import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { keanggotaanController } from "./keanggotaan.controller";
import upload from "../../config/multer.config";

const router = Router();

// Public
router.get("/get", keanggotaanController.getAll);

// Admin only
router.post(
  "/create",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "foto", maxCount: 1 }]),
  keanggotaanController.create,
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "foto", maxCount: 1 }]),
  keanggotaanController.update,
);

router.delete("/:id", verifyToken, isAdmin, keanggotaanController.deleteById);

export default router;
