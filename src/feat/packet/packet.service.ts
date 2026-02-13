import { packetRepository } from "./packet.repository";

const getPackets = async () => {
  return packetRepository.getPackets();
};

export const packetService = {
  getPackets,
};
