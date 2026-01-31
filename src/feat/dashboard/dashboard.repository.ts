import prisma from "../../database/prisma";
import { createWorkshopPayload } from "../../types/types";

const createWorkshop = (payload: createWorkshopPayload) => {
  const { user_id, ...rest } = payload;

  return prisma.workshop.create({
    data: {
      ...rest,
      user_id,
    },
  });
};

const getWorkshopTitle = async (id: string) => {
  return prisma.workshop.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    select: {
      title: true,
    },
  });
};

type WorkshopModuleInput = {
  title: string;
  type: string;
  date: string;
  order: number;
  youtube_url?: string;
  zoom_url?: string;
  whatsapp_group_url?: string;
  exam_form_url?: string;
};

const saveWorkshopModules = async (
  workshopId: string,
  modules: WorkshopModuleInput[],
) => {
  if (modules.length === 0) {
    return [];
  }

  return prisma.workshopModule.createMany({
    data: modules.map((module) => ({
      workshop_id: workshopId,
      title: module.title,
      type: module.type,
      schedule_at: new Date(module.date),
      youtube_url: module.youtube_url ?? null,
      zoom_url: module.zoom_url ?? null,
      whatsapp_group_url: module.whatsapp_group_url ?? null,
      exam_form_url: module.exam_form_url ?? null,
      description: "",
      content_text: null,
      order: module.order,
    })),
  });
};

const getWorkshopModules = async (workshopId: string) => {
  return prisma.workshopModule.findMany({
    where: {
      workshop_id: workshopId,
    },
    orderBy: {
      created_at: "asc",
    },
    select: {
      id: true,
      title: true,
      type: true,
      schedule_at: true,
      order: true,
      youtube_url: true,
      zoom_url: true,
      whatsapp_group_url: true,
      exam_form_url: true,
    },
  });
};

const getWorkshops = () => {
  return prisma.workshop.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

const getWorkshopDetail = async (id: string) => {
  return prisma.workshop.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      modules: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          title: true,
          type: true,
          schedule_at: true,
          order: true,
          youtube_url: true,
          zoom_url: true,
          whatsapp_group_url: true,
          exam_form_url: true,
        },
      },
    },
  });
};

const deleteWorkshopModule = async (
  workshopId: string,
  moduleId: string,
) => {
  return prisma.workshopModule.deleteMany({
    where: {
      id: moduleId,
      workshop_id: workshopId,
    },
  });
};

export const workshopRepository = {
  createWorkshop,
  getWorkshopTitle,
  saveWorkshopModules,
  getWorkshopModules,
  getWorkshopDetail,
  deleteWorkshopModule,
  getWorkshops,
};
