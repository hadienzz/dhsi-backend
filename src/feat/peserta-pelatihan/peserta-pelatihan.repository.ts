import prisma from "../../database/prisma";

const getAll = async () => {
  return await prisma.pesertaPelatihan.findMany({
    orderBy: { created_at: "desc" },
  });
};

const getAllPaginated = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.pesertaPelatihan.findMany({
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.pesertaPelatihan.count(),
  ]);
  return { data, total };
};

const create = async (data: {
  nama_lengkap: string;
  email: string;
  nama_pelatihan: string;
}) => {
  return await prisma.pesertaPelatihan.create({ data });
};

const findById = async (id: string) => {
  return await prisma.pesertaPelatihan.findUnique({ where: { id } });
};

const deleteById = async (id: string) => {
  return await prisma.pesertaPelatihan.delete({ where: { id } });
};

export const pesertaPelatihanRepository = {
  getAll,
  getAllPaginated,
  create,
  findById,
  deleteById,
};
