import { createWorkshopPayload } from "../../types/types";
import { uploadToSupabase } from "../../utils/upload-to-supabase";
import { workshopRepository } from "./dashboard.repository";

const createWorkshop = async (
  payload: createWorkshopPayload,
  thumbnailFile?: Express.Multer.File,
) => {
  let thumbnailUrl = payload.thumbnail;

  if (thumbnailFile) {
    const { url } = await uploadToSupabase(thumbnailFile, "thumbnail");
    thumbnailUrl = url;
  }

  return workshopRepository.createWorkshop({
    ...payload,
    thumbnail: thumbnailUrl,
  });
};

const getWorkshopTitle = async (id: string) => {
  return workshopRepository.getWorkshopTitle(id);
};

type WorkshopModuleDTO = {
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
  modules: WorkshopModuleDTO[],
) => {
  return workshopRepository.saveWorkshopModules(workshopId, modules);
};

const getWorkshopModules = async (workshopId: string) => {
  const rows = await workshopRepository.getWorkshopModules(workshopId);

  return rows.map((row) => {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      // kirim sebagai ISO string, frontend bisa format/ambil tanggal saja
      date: row.schedule_at.toISOString(),
      order: row.order,
      youtube_url: row.youtube_url,
      zoom_url: row.zoom_url,
      whatsapp_group_url: row.whatsapp_group_url,
      exam_form_url: row.exam_form_url,
    };
  });
};

const getWorkshops = async () => {
  return workshopRepository.getWorkshops()
};

const getWorkshopDetail = async (id: string) => {
  const workshop = await workshopRepository.getWorkshopDetail(id);

  if (!workshop) {
    return null;
  }

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof (value as any)?.toNumber === "function") {
      return (value as any).toNumber();
    }
    return Number(value ?? 0);
  };

  return {
    id: workshop.id,
    title: workshop.title,
    short_description: workshop.short_description,
    description: workshop.description,
    category: workshop.category,
    thumbnail: workshop.thumbnail,
    benefits: workshop.benefits,
    price: toNumber(workshop.price),
    created_at: workshop.created_at.toISOString(),
    updated_at: workshop.updated_at.toISOString(),
    modules: workshop.modules.map((module) => ({
      id: module.id,
      title: module.title,
      type: module.type,
      date: module.schedule_at.toISOString(),
      order: module.order,
      youtube_url: module.youtube_url,
      zoom_url: module.zoom_url,
      whatsapp_group_url: module.whatsapp_group_url,
      exam_form_url: module.exam_form_url,
    })),
  };
};

const deleteWorkshopModule = async (workshopId: string, moduleId: string) => {
  await workshopRepository.deleteWorkshopModule(workshopId, moduleId);
};

export const workshopService = {
  createWorkshop,
  getWorkshopTitle,
  saveWorkshopModules,
  getWorkshopModules,
  getWorkshopDetail,
  deleteWorkshopModule,
  getWorkshops,
};
