import prisma from "../../database/prisma";

const getParelegalData = async () => {
  return await prisma.paralegalDHSI.findMany();
};

export const paralegalRepository = {
  getParelegalData,
};
