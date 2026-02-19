import { advokatRepository } from "./advokat.repository";

const getAll = async () => {
  return await advokatRepository.getAll();
};

const create = async (data: {
  nama_lengkap: string;
  role: string;
  upload_foto_formal: string;
}) => {
  return await advokatRepository.create(data);
};

const deleteById = async (id: string) => {
  const existing = await advokatRepository.findById(id);
  if (!existing) throw new Error("Advokat not found");
  return await advokatRepository.deleteById(id);
};

const update = async (
  id: string,
  data: { nama_lengkap?: string; role?: string; upload_foto_formal?: string },
) => {
  const existing = await advokatRepository.findById(id);
  if (!existing) throw new Error("Advokat not found");
  return await advokatRepository.update(id, data);
};

export const advokatService = { getAll, create, deleteById, update };
