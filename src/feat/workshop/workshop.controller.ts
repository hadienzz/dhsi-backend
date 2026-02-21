import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../../utils/response.util";
import { APIError } from "../../middleware/error.middleware";
import { workshopService } from "./workshop.service";
import { workshopRepository } from "./workshop.repository";

export const deleteWorkshop = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.workshopId as string;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    await workshopService.softDeleteWorkshop({
      workshopId,
      userId: user.id,
      userRole: user.role,
    });

    return res.status(200).json({
      status: "success",
      message: "Workshop deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const buyWorkshopWithCredits = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const { workshop_id } = req.body;
    const { id: user_id } = req.user!;

    const result = await workshopService.buyWorkshopWithCredits({
      workshop_id,
      user_id,
    });

    res.status(200).json({
      status: "success",
      message: "Workshop berhasil dibeli",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const checkoutWorkshop = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const user_id = req.user?.id!;
    const name = req.user?.username!;
    const email = req.user?.email!;
    const { workshop_id, payment_method, credits_to_use } = req.body;

    const rawKey = req.header("Idempotency-Key")?.trim();
    if (!rawKey) {
      throw new APIError("Idempotency-Key header is required", 400);
    }

    if (!workshop_id || !payment_method) {
      throw new APIError("workshop_id dan payment_method wajib diisi", 400);
    }

    if (!["money", "hybrid"].includes(payment_method)) {
      throw new APIError("payment_method harus 'money' atau 'hybrid'", 400);
    }

    const result = await workshopService.checkoutWorkshop({
      workshop_id,
      user_id,
      payment_method,
      credits_to_use: credits_to_use ?? 0,
      idempotency_key: rawKey,
      name,
      email,
    });

    return res.status(200).json({
      status: "success",
      message: "Workshop checkout berhasil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkshops = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const rawWorkshops = await workshopRepository.getPublicWorkshops();

    const workshops = rawWorkshops.map((w) => {
      const ratingsArr = w.ratings.map((r) => r.rating);
      const avgRating =
        ratingsArr.length > 0
          ? parseFloat(
              (ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length).toFixed(1),
            )
          : 0;

      return {
        id: w.id,
        title: w.title,
        short_description: w.short_description,
        description: w.description,
        category: w.category,
        thumbnail: w.thumbnail,
        price: w.price,
        credit_price: w.credit_price,
        benefits: w.benefits,
        start_date: w.start_date ?? w.modules[0]?.schedule_at ?? null,
        created_at: w.created_at,
        participant_count: w._count.selected_users,
        avg_rating: avgRating,
        rating_count: ratingsArr.length,
        module_count: w.modules.length,
        modules: w.modules.map((m) => ({
          id: m.id,
          title: m.title,
          schedule_at: m.schedule_at,
          type: m.type,
          order: m.order,
        })),
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Workshops retrieved",
      data: workshops,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkshopDetailPublic = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const workshop = await workshopRepository.getWorkshopDetail(id);

    if (!workshop) {
      throw new APIError("Workshop not found", 404);
    }

    // Check if user owns this workshop (if authenticated)
    let isOwned = false;
    if (req.user) {
      isOwned = await workshopRepository.checkUserOwnsWorkshop(req.user.id, id);
    }

    return res.status(200).json({
      status: "success",
      message: "Workshop detail retrieved",
      data: { ...workshop, is_owned: isOwned },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyWorkshops = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const workshops = await workshopRepository.getUserWorkshops(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "User workshops retrieved",
      data: workshops,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkshopContent = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const id = req.params.id as string;

    // Check if user has purchased this workshop
    const isOwned = await workshopRepository.checkUserOwnsWorkshop(
      req.user.id,
      id,
    );

    if (!isOwned) {
      throw new APIError(
        "Anda harus membeli workshop ini terlebih dahulu untuk mengakses konten.",
        403,
      );
    }

    const workshop = await workshopRepository.getWorkshopContentWithProgress(
      id,
      req.user.id,
    );

    if (!workshop) {
      throw new APIError("Workshop not found", 404);
    }

    return res.status(200).json({
      status: "success",
      message: "Workshop content retrieved",
      data: workshop,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleModuleProgress = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const moduleId = req.params.moduleId as string;

    const result = await workshopService.toggleModuleProgress({
      userId: req.user.id,
      moduleId,
    });

    return res.status(200).json({
      status: "success",
      message: result.is_completed
        ? "Modul ditandai selesai"
        : "Modul ditandai belum selesai",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const workshopController = {
  deleteWorkshop,
  buyWorkshopWithCredits,
  checkoutWorkshop,
  getWorkshops,
  getWorkshopDetailPublic,
  getMyWorkshops,
  getWorkshopContent,
  toggleModuleProgress,
  submitRating,
  getWorkshopRatings,
};

async function submitRating(
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new APIError("Unauthorized", 401);
    }

    const { workshop_id, rating, review } = req.body;

    if (!workshop_id || !rating) {
      throw new APIError("workshop_id dan rating wajib diisi", 400);
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw new APIError("Rating harus berupa angka antara 1-5", 400);
    }

    const result = await workshopService.submitRating({
      userId: req.user.id,
      workshopId: workshop_id,
      rating,
      review: review || null,
    });

    return res.status(200).json({
      status: "success",
      message: "Rating berhasil disimpan",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getWorkshopRatings(
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) {
  try {
    const workshopId = req.params.workshopId as string;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 5),
    );

    const [ratings, summary] = await Promise.all([
      workshopRepository.getRatingsByWorkshop(workshopId, page, limit),
      workshopRepository.getWorkshopRatingSummary(workshopId),
    ]);

    // If user is authenticated, include their own rating
    let user_rating = null;
    if (req.user) {
      user_rating = await workshopRepository.getUserRatingForWorkshop(
        req.user.id,
        workshopId,
      );
    }

    return res.status(200).json({
      status: "success",
      message: "Ratings retrieved",
      data: {
        ...ratings,
        ...summary,
        user_rating,
      },
    });
  } catch (err) {
    next(err);
  }
}
