import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(2, "Username minimal 2 karakter").optional(),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").optional(),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  occupation: z.string().max(100).optional(),
  institution: z.string().max(200).optional(),
  date_of_birth: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
