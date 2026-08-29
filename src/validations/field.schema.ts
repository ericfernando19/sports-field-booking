import { z } from "zod";

export const fieldSchema = z.object({
  name: z.string().min(2, "Nama lapangan harus minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug harus minimal 2 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"
    ),
  sportType: z.enum([
    "FUTSAL",
    "BADMINTON",
    "BASKETBALL",
    "TENNIS",
    "VOLLEYBALL",
    "MINI_SOCCER",
  ]),
  description: z.string().optional(),
  location: z.string().min(2, "Lokasi harus diisi"),
  pricePerHour: z
    .number()
    .min(10000, "Harga minimal Rp 10.000")
    .max(10000000, "Harga terlalu besar"),
  facilities: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean(),
});

export type FieldInput = z.infer<typeof fieldSchema>;
