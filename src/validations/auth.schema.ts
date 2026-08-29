import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama harus minimal 2 karakter")
      .max(100, "Nama terlalu panjang"),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(10, "Nomor telepon minimal 10 digit")
      .max(15, "Nomor telepon maksimal 15 digit")
      .regex(/^[0-9]+$/, "Nomor telepon hanya boleh berisi angka"),
    password: z
      .string()
      .min(8, "Password harus minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus mengandung huruf besar, huruf kecil, dan angka"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
