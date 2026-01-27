import prisma from "../../database/prisma";
import { createWorkshopPayload } from "../../types/types";

const createWorkshop = (payload: createWorkshopPayload) => {
  const { user_id, ...rest } = payload;

  return prisma.workshop.create({
    data: {
      ...rest,
      user_id,
    },
  });
};

export const workshopRepository = {
  createWorkshop,
};
