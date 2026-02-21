import prisma from "../../database/prisma";

const getAll = async () => {
  return await prisma.keanggotaanDHSI.findMany({
    select: {
      id: true,
      nama_lengkap: true,
      role: true,
      kategori: true,
      upload_foto_formal: true,
    },
  });
};

const create = async (data: {
  nama_lengkap: string;
  role: string;
  kategori: string;
  upload_foto_formal: string;
}) => {
  return await prisma.keanggotaanDHSI.create({ data });
};

const deleteById = async (id: string) => {
  return await prisma.keanggotaanDHSI.delete({ where: { id } });
};

const findById = async (id: string) => {
  return await prisma.keanggotaanDHSI.findUnique({ where: { id } });
};

const update = async (
  id: string,
  data: { nama_lengkap?: string; role?: string; kategori?: string; upload_foto_formal?: string },
) => {
  return await prisma.keanggotaanDHSI.update({ where: { id }, data });
};

export const keanggotaanRepository = {
  getAll,
  create,
  deleteById,
  findById,
  update,
};
