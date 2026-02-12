import z from "zod";

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
  description: z.string(),
  credit_price: z.coerce.number(),
});

const moduleTypeEnum = z.enum([
  "video_exam",
  "video_discussion",
  "live_class_exam",
  "exam_only",
]);

export const workshopModuleSchema = z.object({
  title: z.string().min(3, "Judul modul minimal 3 karakter"),
  type: moduleTypeEnum,
  date: z
    .string()
    .refine((value) => {
      const timestamp = Date.parse(value);
      if (Number.isNaN(timestamp)) return false;

      const d = new Date(timestamp);
      const year = d.getUTCFullYear();

      // Batasi ke range yang aman untuk Postgres/Prisma
      return year >= 1900 && year <= 2100;
    }, {
      message: "Tanggal modul tidak valid atau di luar rentang yang diperbolehkan",
    }),
  order: z.number().int().min(1),
  // URL dibuat longgar: cukup string bebas atau kosong, supaya
  // bisa menyimpan banyak modul sekaligus tanpa error 400
  youtube_url: z.string().optional().or(z.literal("")),
  zoom_url: z.string().optional().or(z.literal("")),
  whatsapp_group_url: z.string().optional().or(z.literal("")),
  exam_form_url: z.string().optional().or(z.literal("")),
});

export const createWorkshopModulesSchema = z.object({
  modules: z
    .array(workshopModuleSchema)
    .min(1, "Minimal satu modul harus ditambahkan"),
});
