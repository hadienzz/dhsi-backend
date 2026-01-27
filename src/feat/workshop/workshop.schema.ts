import z, { number } from "zod";

export const createWorkshopSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  short_description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  // thumbnail dikirim sebagai file (multer), bukan field teks di body,
  // jadi di schema cukup dibuat opsional agar tidak mengganggu validasi body.
  thumbnail: z.any().optional(),
  benefits: z.array(
    z.string().min(1, "Benefit must be at least 1 character long"),
  ),
  category: z.string(),
  // level: z.string().min(3, "Level must be at least 3 characters long"),
  description: z.string(),
  price: z.string(),
});
