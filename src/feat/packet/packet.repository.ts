import prisma from "../../database/prisma";

const getPackets = async () => {
  const packets = await prisma.pricingPackage.findMany({});

  return packets;
};

export const packetRepository = {
  getPackets,
};
