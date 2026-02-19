import prisma from "../../database/prisma";

const getParelegalData = async () => {
  return await prisma.paralegalDHSI.findMany({
    select: {
      id: true,
      nama_lengkap: true,
      upload_foto_formal: true,
      rencana_kantor_wilayah: true,
    },
  });
};

export const paralegalRepository = {
  getParelegalData,
};
