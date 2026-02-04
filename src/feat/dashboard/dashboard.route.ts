import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { validate } from "../../utils/validate.util";
import {
  createWorkshopSchema,
  createWorkshopModulesSchema,
} from "./dashboard.schema";
import { workshopController } from "./dashboard.controller";
import upload from "../../config/multer.config";
import { isAdmin } from "../../middleware/admin.middleware";

const router = Router();

router.post(
  "/create-workshop",
  verifyToken,
  isAdmin,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  validate(createWorkshopSchema, "body"),
  workshopController.createWorkshop,
);

router.get(
  "/:id/title",
  verifyToken,
  isAdmin,
  workshopController.getWorkshopTitle,
);

router.post(
  "/workshops/:id/modules",
  verifyToken,
  isAdmin,
  validate(createWorkshopModulesSchema, "body"),
  workshopController.saveWorkshopModules,
);

router.get(
  "/workshops/:id/modules",
  verifyToken,
  isAdmin,
  workshopController.getWorkshopModules,
);

router.get(
  "/workshops/:id/detail",
  verifyToken,
  isAdmin,
  workshopController.getWorkshopDetail,
);

router.delete(
  "/workshops/:workshopId/modules/:moduleId",
  verifyToken,
  isAdmin,
  workshopController.deleteWorkshopModule,
);

router.get("/workshops", verifyToken, isAdmin, workshopController.getWorkshops);

export default router;
