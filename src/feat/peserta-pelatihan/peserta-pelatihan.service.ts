import { pesertaPelatihanRepository } from "./peserta-pelatihan.repository";

const getAll = async () => {
  return await pesertaPelatihanRepository.getAll();
};

const getAllPaginated = async (page: number, limit: number) => {
  return await pesertaPelatihanRepository.getAllPaginated(page, limit);
};

const create = async (data: {
  nama_lengkap: string;
  email: string;
  nama_pelatihan: string;
}) => {
  return await pesertaPelatihanRepository.create(data);
};

const deleteById = async (id: string) => {
  const existing = await pesertaPelatihanRepository.findById(id);
  if (!existing) throw new Error("Peserta pelatihan not found");
  return await pesertaPelatihanRepository.deleteById(id);
};

export const pesertaPelatihanService = { getAll, getAllPaginated, create, deleteById };
