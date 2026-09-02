"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { fieldSchema, type FieldInput } from "@/validations/field.schema";
import { type ApiResponse, type PaginatedResponse, type FieldWithSchedules } from "@/types";

export async function getFields(params?: {
  search?: string;
  sportType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<FieldWithSchedules>> {
  const {
    search,
    sportType,
    minPrice,
    maxPrice,
    sortBy = "name",
    page = 1,
    pageSize = 12,
  } = params || {};

  const where: any = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { location: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const validSportTypes = ["FUTSAL", "BADMINTON", "BASKETBALL", "TENNIS", "VOLLEYBALL", "MINI_SOCCER"];
  if (sportType && validSportTypes.includes(sportType)) {
    where.sportType = sportType as any;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerHour = {};
    if (minPrice !== undefined) where.pricePerHour.gte = minPrice;
    if (maxPrice !== undefined) where.pricePerHour.lte = maxPrice;
  }

  const orderBy: any =
    sortBy === "price_asc"
      ? { pricePerHour: "asc" }
      : sortBy === "price_desc"
      ? { pricePerHour: "desc" }
      : sortBy === "newest"
      ? { createdAt: "desc" }
      : { name: "asc" };

  const [items, total] = await Promise.all([
    prisma.field.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.field.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFieldBySlug(
  slug: string
): Promise<FieldWithSchedules | null> {
  const field = await prisma.field.findUnique({
    where: { slug },
  });

  return field;
}

export async function getFieldById(id: string): Promise<FieldWithSchedules | null> {
  const field = await prisma.field.findUnique({
    where: { id },
  });

  return field;
}

export async function getFeaturedFields(): Promise<FieldWithSchedules[]> {
  const fields = await prisma.field.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return fields;
}

export async function getAllFields(params?: {
  search?: string;
  sportType?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<FieldWithSchedules>> {
  await requireAdmin();

  const {
    search,
    sportType,
    isActive,
    page = 1,
    pageSize = 10,
  } = params || {};

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { location: { contains: search } },
    ];
  }

  const validSportTypes2 = ["FUTSAL", "BADMINTON", "BASKETBALL", "TENNIS", "VOLLEYBALL", "MINI_SOCCER"];
  if (sportType && validSportTypes2.includes(sportType)) {
    where.sportType = sportType as any;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [items, total] = await Promise.all([
    prisma.field.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.field.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createField(
  data: FieldInput
): Promise<ApiResponse<FieldWithSchedules>> {
  try {
    await requireAdmin();

    const validated = fieldSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const existingSlug = await prisma.field.findUnique({
      where: { slug: validated.data.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        message: "Slug sudah digunakan",
        errors: { slug: ["Slug sudah ada"] },
      };
    }

    const field = await prisma.field.create({
      data: validated.data,
    });

    const defaultTimeSlots = [
      { startTime: "07:00", endTime: "08:00" },
      { startTime: "08:00", endTime: "09:00" },
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
      { startTime: "13:00", endTime: "14:00" },
      { startTime: "14:00", endTime: "15:00" },
      { startTime: "15:00", endTime: "16:00" },
      { startTime: "16:00", endTime: "17:00" },
      { startTime: "17:00", endTime: "18:00" },
      { startTime: "18:00", endTime: "19:00" },
      { startTime: "19:00", endTime: "20:00" },
      { startTime: "20:00", endTime: "21:00" },
    ];

    const schedulesToCreate: {
      fieldId: string;
      date: Date;
      startTime: string;
      endTime: string;
      price: number;
      status: string;
    }[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      for (const slot of defaultTimeSlots) {
        schedulesToCreate.push({
          fieldId: field.id,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: validated.data.pricePerHour,
          status: "AVAILABLE",
        });
      }
    }

    if (schedulesToCreate.length > 0) {
      await prisma.schedule.createMany({
        data: schedulesToCreate as any,
        skipDuplicates: true,
      });
    }

    revalidatePath("/fields");
    revalidatePath("/");

    return {
      success: true,
      message: "Lapangan berhasil dibuat dengan jadwal 7 hari ke depan",
      data: field,
    };
  } catch (error) {
    console.error("Create field error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat lapangan",
    };
  }
}

export async function updateField(
  id: string,
  data: FieldInput
): Promise<ApiResponse<FieldWithSchedules>> {
  try {
    await requireAdmin();

    const validated = fieldSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const existingField = await prisma.field.findUnique({ where: { id } });
    if (!existingField) {
      return {
        success: false,
        message: "Lapangan tidak ditemukan",
      };
    }

    if (existingField.slug !== validated.data.slug) {
      const existingSlug = await prisma.field.findUnique({
        where: { slug: validated.data.slug },
      });
      if (existingSlug) {
        return {
          success: false,
          message: "Slug sudah digunakan",
          errors: { slug: ["Slug sudah ada"] },
        };
      }
    }

    const field = await prisma.field.update({
      where: { id },
      data: validated.data,
    });

    revalidatePath("/fields");
    revalidatePath("/");
    revalidatePath(`/fields/${field.slug}`);

    return {
      success: true,
      message: "Lapangan berhasil diperbarui",
      data: field,
    };
  } catch (error) {
    console.error("Update field error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui lapangan",
    };
  }
}

export async function deleteField(id: string): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const existingField = await prisma.field.findUnique({
      where: { id },
      include: { bookings: { take: 1 } },
    });

    if (!existingField) {
      return {
        success: false,
        message: "Lapangan tidak ditemukan",
      };
    }

    if (existingField.bookings.length > 0) {
      await prisma.field.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/fields");
      revalidatePath("/");

      return {
        success: true,
        message: "Lapangan berhasil dinonaktifkan (memiliki riwayat booking)",
      };
    }

    await prisma.field.delete({ where: { id } });

    revalidatePath("/fields");
    revalidatePath("/");

    return {
      success: true,
      message: "Lapangan berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete field error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus lapangan",
    };
  }
}

export async function toggleFieldStatus(id: string): Promise<ApiResponse<FieldWithSchedules>> {
  try {
    await requireAdmin();

    const field = await prisma.field.findUnique({ where: { id } });
    if (!field) {
      return {
        success: false,
        message: "Lapangan tidak ditemukan",
      };
    }

    const updated = await prisma.field.update({
      where: { id },
      data: { isActive: !field.isActive },
    });

    revalidatePath("/fields");
    revalidatePath("/");

    return {
      success: true,
      message: `Lapangan berhasil ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      data: updated,
    };
  } catch (error) {
    console.error("Toggle field status error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan",
    };
  }
}
