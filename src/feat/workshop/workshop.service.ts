import { createWorkshopPayload } from "../../types/types";
import { uploadToSupabase } from "../../utils/upload-to-supabase";
import { workshopRepository } from "./workshop.repository";

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

export const workshopService = {
  createWorkshop,
};
