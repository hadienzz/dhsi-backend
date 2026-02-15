import prisma from "../../database/prisma";

const getPackets = async () => {
  const packets = await prisma.pricingPackage.findMany({});

  return packets;
};

const getPacketById = async (id: string) => {
  const packet = await prisma.pricingPackage.findUnique({
    where: { id },
  });

  return packet;
};

export const packetRepository = {
  getPackets,
  getPacketById,
};
