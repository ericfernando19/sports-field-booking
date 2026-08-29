"use server";

import { registerSchema, type RegisterInput } from "@/validations/auth.schema";
import { auth, signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { type ApiResponse } from "@/types";

export async function register(
  data: RegisterInput
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const validated = registerSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { name, email, phone, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email sudah terdaftar",
        errors: { email: ["Email sudah digunakan"] },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Registrasi berhasil",
      data: { userId: user.id },
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat registrasi",
    };
  }
}

export async function login(
  email: string,
  password: string,
  redirectTo?: string
): Promise<ApiResponse> {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTo ?? "/fields",
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        message: "Email atau password salah",
      };
    }

    return {
      success: true,
      message: "Login berhasil",
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat login",
    };
  }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getSession() {
  return await auth();
}
