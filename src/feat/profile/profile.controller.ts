import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import { z } from "zod";
import { updateProfileSchema } from "./profile.schema";
import { getProfileService, updateProfileService } from "./profile.service";

const getProfile = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const profile = await getProfileService(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Profile berhasil diambil",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const input = req.body as z.infer<typeof updateProfileSchema>;
    const profile = await updateProfileService(req.user.id, input);

    res.status(200).json({
      status: "success",
      message: "Profile berhasil diperbarui",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export const profileController = {
  getProfile,
  updateProfile,
};
