import { randomUUID } from "crypto";
import supabaseClient from "../database/supabase";

export const uploadToSupabase = async (
  file: Express.Multer.File,
  prefix: "thumbnail" | "profile",
) => {
  const bucket = "DHSI-Storage";
  const ext = file.originalname.split(".").pop() || "bin";
  const path = `${prefix}/${randomUUID()}.${ext}`;
  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (error) throw error;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
};
