import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/admin.middleware";
import { pesertaPelatihanController } from "./peserta-pelatihan.controller";

const router = Router();

// Public - get all
router.get("/get", pesertaPelatihanController.getAll);

// Admin only
router.post("/create", verifyToken, isAdmin, pesertaPelatihanController.create);
router.delete("/:id", verifyToken, isAdmin, pesertaPelatihanController.deleteById);

export default router;
