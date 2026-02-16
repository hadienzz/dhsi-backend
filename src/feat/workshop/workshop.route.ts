import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { workshopController } from "./workshop.controller";

const router = Router();

// Public routes (no auth needed for browsing)
router.get("/", workshopController.getWorkshops);
router.get("/detail/:id", workshopController.getWorkshopDetailPublic);

// Authenticated routes
router.post(
  "/buy-workshop",
  verifyToken,
  workshopController.buyWorkshopWithCredits,
);

router.get("/my-workshops", verifyToken, workshopController.getMyWorkshops);

// Purchase-gated content (must own the workshop)
router.get("/content/:id", verifyToken, workshopController.getWorkshopContent);

// Module progress
router.patch(
  "/modules/:moduleId/toggle-progress",
  verifyToken,
  workshopController.toggleModuleProgress,
);

router.delete(
  "/:workshopId/delete",
  verifyToken,
  workshopController.deleteWorkshop,
);

export default router;
