import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { workshopController } from "./workshop.controller";

const router = Router();

// Public checkout route for workshop (requires authenticated user, not necessarily admin)
router.post(
  "/:id/checkout",
  verifyToken,
  workshopController.createWorkshopPayment,
);

router.delete("/:workshopId/delete",verifyToken,workshopController.deleteWorkshop);

export default router;
