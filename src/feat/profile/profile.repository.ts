import prisma from "../../database/prisma";
import { UpdateProfileInput } from "./profile.schema";

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      role: true,
      bio: true,
      avatar_url: true,
      address: true,
      city: true,
      province: true,
      postal_code: true,
      occupation: true,
      institution: true,
      date_of_birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const updateUserProfile = async (
  id: string,
  data: Omit<UpdateProfileInput, "date_of_birth"> & {
    updated_at: Date;
    date_of_birth?: Date;
  }
) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      phone: true,
      role: true,
      bio: true,
      avatar_url: true,
      address: true,
      city: true,
      province: true,
      postal_code: true,
      occupation: true,
      institution: true,
      date_of_birth: true,
      created_at: true,
      updated_at: true,
    },
  });
};
