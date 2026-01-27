import { NextFunction, Response, Request } from "express";
import { APIResponse } from "../../utils/response.util";
import { createWorkshopSchema } from "./workshop.schema";
import z from "zod";
import { workshopService } from "./workshop.service";
import { createWorkshopPayload } from "../../types/types";

const createWorkshop = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const { category, short_description, title, benefits, description, price } =
      req.body as z.infer<typeof createWorkshopSchema>;
    const user_id = req.user?.id as string;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const thumbnailFile = files?.thumbnail?.[0];

    const newWorkshop: createWorkshopPayload = {
      category,
      short_description,
      title,
      // placeholder, akan diganti oleh service jika ada file thumbnail
      thumbnail: "",
      benefits,
      description,
      price: Number(price),
      user_id,
    };

    const workshop = await workshopService.createWorkshop(
      newWorkshop,
      thumbnailFile,
    );

    return res.status(201).json({
      status: "success",
      message: "Workshop created successfully",
      data: { workshop_id: workshop.id },
    });
  } catch (error) {
    next(error);
  }
};

export const workshopController = {
  createWorkshop,
};
