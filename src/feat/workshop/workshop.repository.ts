import prisma from "../../database/prisma";

const selectedWorkshop = (workshop_id: string) => {
  const workshop = prisma.workshop.findUnique({
    where: { id: workshop_id },
    select: { id: true, credit_price: true, title: true },
  });

  return workshop;
};

const buyWorkshopWithCredits = () => {};

export const workshopRepository = {
  buyWorkshopWithCredits,
  selectedWorkshop, 
};
