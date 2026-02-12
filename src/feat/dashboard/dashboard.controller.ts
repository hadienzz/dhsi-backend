import { NextFunction, Response, Request } from "express";
import { APIResponse } from "../../utils/response.util";
import {
  createWorkshopSchema,
  createWorkshopModulesSchema,
} from "./dashboard.schema";
import z from "zod";
import { workshopService } from "./dashboard.service";
import { createWorkshopPayload } from "../../types/types";

const createWorkshop = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const {
      category,
      short_description,
      title,
      benefits,
      description,
      credit_price,
    } = req.body as z.infer<typeof createWorkshopSchema>;
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
      credit_price,
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

const getWorkshopTitle = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.id as string;
    const workshop = await workshopService.getWorkshopTitle(workshopId);

    return res.status(200).json({
      status: "success",
      message: "Workshop title retrieved successfully",
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
};

const saveWorkshopModules = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.id as string;
    const { modules } = req.body as z.infer<typeof createWorkshopModulesSchema>;

    await workshopService.saveWorkshopModules(workshopId, modules);

    return res.status(200).json({
      status: "success",
      message: "Workshop modules saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getWorkshopModules = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.id as string;
    const modules = await workshopService.getWorkshopModules(workshopId);

    return res.status(200).json({
      status: "success",
      message: "Workshop modules retrieved successfully",
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

const getWorkshops = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshops = await workshopService.getWorkshops();
    console.log(workshops);
    return res.status(200).json({
      status: "success",
      message: "Workshops retrieved successfully",
      data: workshops,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkshopDetail = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.id as string;
    const workshop = await workshopService.getWorkshopDetail(workshopId);

    return res.status(200).json({
      status: "success",
      message: "Workshop detail retrieved successfully",
      data: workshop,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWorkshopModule = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const workshopId = req.params.workshopId as string;
    const moduleId = req.params.moduleId as string;

    await workshopService.deleteWorkshopModule(workshopId, moduleId);

    return res.status(200).json({
      status: "success",
      message: "Workshop module deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const workshopController = {
  createWorkshop,
  getWorkshopTitle,
  saveWorkshopModules,
  getWorkshopModules,
  getWorkshopDetail,
  deleteWorkshopModule,
  getWorkshops,
};
