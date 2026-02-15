import { Request, Response, NextFunction } from "express";
import { APIResponse } from "../../utils/response.util";
import { workshopService } from "./workshop.service";

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
      message: "Workshop purchased successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const workshopController = {
  deleteWorkshop,
  buyWorkshopWithCredits,
};
