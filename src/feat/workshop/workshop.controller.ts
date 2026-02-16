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

export const getWorkshops = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshops = await workshopRepository.getPublicWorkshops();

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
  getWorkshops,
  getWorkshopDetailPublic,
  getMyWorkshops,
  getWorkshopContent,
  toggleModuleProgress,
};
