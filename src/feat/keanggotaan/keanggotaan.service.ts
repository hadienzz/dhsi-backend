import { keanggotaanRepository } from "./keanggotaan.repository";

const getAll = async () => {
  return await keanggotaanRepository.getAll();
};

const create = async (data: {
  nama_lengkap: string;
  role: string;
  upload_foto_formal: string;
}) => {
  return await keanggotaanRepository.create(data);
};

const deleteById = async (id: string) => {
  const existing = await keanggotaanRepository.findById(id);
  if (!existing) throw new Error("Keanggotaan not found");
  return await keanggotaanRepository.deleteById(id);
};

const update = async (
  id: string,
  data: { nama_lengkap?: string; role?: string; upload_foto_formal?: string },
) => {
  const existing = await keanggotaanRepository.findById(id);
  if (!existing) throw new Error("Keanggotaan not found");
  return await keanggotaanRepository.update(id, data);
};

export const keanggotaanService = { getAll, create, deleteById, update };
