import { paralegalRepository } from "./paralegal.repository";

const getParalegalData = async () => {
  return await paralegalRepository.getParelegalData();
};

export const paralegalService = {
  getParalegalData,
};
