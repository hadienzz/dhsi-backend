import { APIError } from "../../middleware/error.middleware";
import { findUserById, updateUserProfile } from "./profile.repository";
import { UpdateProfileInput } from "./profile.schema";

export const getProfileService = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new APIError("User tidak ditemukan", 404);
  }

  return user;
};

export const updateProfileService = async (
  userId: string,
  input: UpdateProfileInput
) => {
  const existingUser = await findUserById(userId);

  if (!existingUser) {
    throw new APIError("User tidak ditemukan", 404);
  }

  type UpdateProfileData = Omit<UpdateProfileInput, "date_of_birth"> & {
    updated_at: Date;
    date_of_birth?: Date;
  };

  const { date_of_birth, ...rest } = input;

  const updateData: UpdateProfileData = {
    ...rest,
    updated_at: new Date(),
  };

  if (date_of_birth) {
    const parsed = new Date(date_of_birth);
    if (Number.isNaN(parsed.getTime())) {
      throw new APIError("Tanggal lahir tidak valid", 400);
    }
    updateData.date_of_birth = parsed;
  }

  const updatedUser = await updateUserProfile(userId, updateData);

  return updatedUser;
};
