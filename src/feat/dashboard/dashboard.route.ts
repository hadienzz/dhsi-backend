import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { validate } from "../../utils/validate.util";
import {
  createWorkshopSchema,
  createWorkshopModulesSchema,
} from "./dashboard.schema";
import { workshopController } from "./dashboard.controller";
import upload from "../../config/multer.config";

const router = Router();

router.post(
  "/create-workshop",
  verifyToken,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  validate(createWorkshopSchema, "body"),
  workshopController.createWorkshop,
);

router.get("/:id/title", verifyToken, workshopController.getWorkshopTitle);

router.post(
  "/workshops/:id/modules",
  verifyToken,
  validate(createWorkshopModulesSchema, "body"),
  workshopController.saveWorkshopModules,
);

router.get(
  "/workshops/:id/modules",
  verifyToken,
  workshopController.getWorkshopModules,
);

router.get(
  "/workshops/:id/detail",
  verifyToken,
  workshopController.getWorkshopDetail,
);

router.delete(
  "/workshops/:workshopId/modules/:moduleId",
  verifyToken,
  workshopController.deleteWorkshopModule,
);

router.get("/workshops", verifyToken, workshopController.getWorkshops);

export default router;
