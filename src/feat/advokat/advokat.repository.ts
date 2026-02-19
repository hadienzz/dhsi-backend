import prisma from "../../database/prisma";

const getAll = async () => {
  return await prisma.advokatDHSI.findMany({
    select: {
      id: true,
      nama_lengkap: true,
      role: true,
      upload_foto_formal: true,
    },
  });
};

const create = async (data: {
  nama_lengkap: string;
  role: string;
  upload_foto_formal: string;
}) => {
  return await prisma.advokatDHSI.create({ data });
};

const deleteById = async (id: string) => {
  return await prisma.advokatDHSI.delete({ where: { id } });
};

const findById = async (id: string) => {
  return await prisma.advokatDHSI.findUnique({ where: { id } });
};

const update = async (
  id: string,
  data: { nama_lengkap?: string; role?: string; upload_foto_formal?: string },
) => {
  return await prisma.advokatDHSI.update({ where: { id }, data });
};

export const advokatRepository = {
  getAll,
  create,
  deleteById,
  findById,
  update,
};
