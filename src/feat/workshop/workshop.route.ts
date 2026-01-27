import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { validate } from "../../utils/validate.util";
import { createWorkshopSchema } from "./workshop.schema";
import { workshopController } from "./workshop.controller";
import upload from "../../config/multer.config";

const router = Router();

router.post(
  "/create-workshop",
  verifyToken,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  validate(createWorkshopSchema, "body"),
  workshopController.createWorkshop,
);

export default router;
