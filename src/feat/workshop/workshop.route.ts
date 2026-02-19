import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { workshopController } from "./workshop.controller";
import { verifyAccessToken } from "../../utils/token.util";
import prisma from "../../database/prisma";

// Optional auth middleware: populates req.user if token exists, but doesn't block
const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken =
      req.cookies?.accessToken ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : undefined);

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          is_verified: true,
        },
      });
      if (user) req.user = user;
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
  next();
};

const router = Router();

// Public routes (no auth needed for browsing)
router.get("/", workshopController.getWorkshops);
router.get(
  "/detail/:id",
  optionalAuth,
  workshopController.getWorkshopDetailPublic,
);

// Authenticated routes
router.post(
  "/buy-workshop",
  verifyToken,
  workshopController.buyWorkshopWithCredits,
);

router.post("/checkout", verifyToken, workshopController.checkoutWorkshop);

router.get("/my-workshops", verifyToken, workshopController.getMyWorkshops);

// Purchase-gated content (must own the workshop)
router.get("/content/:id", verifyToken, workshopController.getWorkshopContent);

// Module progress
router.patch(
  "/modules/:moduleId/toggle-progress",
  verifyToken,
  workshopController.toggleModuleProgress,
);

// Rating routes
router.post("/ratings", verifyToken, workshopController.submitRating);
router.get(
  "/:workshopId/ratings",
  optionalAuth,
  workshopController.getWorkshopRatings,
);

router.delete(
  "/:workshopId/delete",
  verifyToken,
  workshopController.deleteWorkshop,
);

export default router;
