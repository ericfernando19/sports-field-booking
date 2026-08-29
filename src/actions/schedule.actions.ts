"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { scheduleSchema, bulkScheduleSchema, type ScheduleInput, type BulkScheduleInput } from "@/validations/schedule.schema";
import { type ApiResponse, type ScheduleWithStatus } from "@/types";

export async function getSchedulesByFieldAndDate(
  fieldId: string,
  date: string
): Promise<ScheduleWithStatus[]> {
  const schedules = await prisma.schedule.findMany({
    where: {
      fieldId,
      date: new Date(date),
    },
    orderBy: { startTime: "asc" },
  });

  return schedules;
}

export async function getAvailableSchedulesByDate(
  fieldId: string,
  date: string
): Promise<ScheduleWithStatus[]> {
  const schedules = await prisma.schedule.findMany({
    where: {
      fieldId,
      date: new Date(date),
      status: "AVAILABLE",
    },
    orderBy: { startTime: "asc" },
  });

  return schedules;
}

export async function getSchedulesByField(
  fieldId: string,
  startDate: string,
  endDate: string
): Promise<ScheduleWithStatus[]> {
  const schedules = await prisma.schedule.findMany({
    where: {
      fieldId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return schedules;
}

export async function createSchedule(
  data: ScheduleInput
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const validated = scheduleSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { fieldId, date, startTime, endTime, price, status } = validated.data;

    const existing = await prisma.schedule.findUnique({
      where: {
        fieldId_date_startTime: {
          fieldId,
          date: new Date(date),
          startTime,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        message: "Jadwal sudah ada untuk jam ini",
      };
    }

    await prisma.schedule.create({
      data: {
        fieldId,
        date: new Date(date),
        startTime,
        endTime,
        price,
        status: status as any,
      },
    });

    return {
      success: true,
      message: "Jadwal berhasil dibuat",
    };
  } catch (error) {
    console.error("Create schedule error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat jadwal",
    };
  }
}

export async function createBulkSchedule(
  data: BulkScheduleInput
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const validated = bulkScheduleSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { fieldId, dates, timeSlots, status } = validated.data;

    const field = await prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      return {
        success: false,
        message: "Lapangan tidak ditemukan",
      };
    }

    const schedulesToCreate: {
      fieldId: string;
      date: Date;
      startTime: string;
      endTime: string;
      price: number;
      status: string;
    }[] = [];

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      for (const slot of timeSlots) {
        const existing = await prisma.schedule.findUnique({
          where: {
            fieldId_date_startTime: {
              fieldId,
              date,
              startTime: slot.startTime,
            },
          },
        });

        if (!existing) {
          schedulesToCreate.push({
            fieldId,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            price: field.pricePerHour,
            status: status as any,
          });
        }
      }
    }

    if (schedulesToCreate.length > 0) {
      await prisma.schedule.createMany({
        data: schedulesToCreate as any,
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: `${schedulesToCreate.length} jadwal berhasil dibuat`,
    };
  } catch (error) {
    console.error("Create bulk schedule error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuat jadwal",
    };
  }
}

export async function updateScheduleStatus(
  scheduleId: string,
  status: string
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return {
        success: false,
        message: "Jadwal tidak ditemukan",
      };
    }

    if (schedule.status === "BOOKED" && status !== "BOOKED") {
      return {
        success: false,
        message: "Tidak dapat mengubah jadwal yang sudah dibooking",
      };
    }

    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: status as any },
    });

    return {
      success: true,
      message: "Jadwal berhasil diperbarui",
    };
  } catch (error) {
    console.error("Update schedule status error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memperbarui jadwal",
    };
  }
}

export async function blockSchedules(
  scheduleIds: string[]
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    await prisma.schedule.updateMany({
      where: {
        id: { in: scheduleIds },
        status: { not: "BOOKED" },
      },
      data: { status: "BLOCKED" },
    });

    return {
      success: true,
      message: "Jadwal berhasil diblokir",
    };
  } catch (error) {
    console.error("Block schedules error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat memblokir jadwal",
    };
  }
}

export async function unblockSchedules(
  scheduleIds: string[]
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    await prisma.schedule.updateMany({
      where: {
        id: { in: scheduleIds },
        status: "BLOCKED",
      },
      data: { status: "AVAILABLE" },
    });

    return {
      success: true,
      message: "Jadwal berhasil dibuka",
    };
  } catch (error) {
    console.error("Unblock schedules error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membuka jadwal",
    };
  }
}

export async function deleteSchedule(
  scheduleId: string
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return {
        success: false,
        message: "Jadwal tidak ditemukan",
      };
    }

    if (schedule.status === "BOOKED") {
      return {
        success: false,
        message: "Tidak dapat menghapus jadwal yang sudah dibooking",
      };
    }

    await prisma.schedule.delete({ where: { id: scheduleId } });

    return {
      success: true,
      message: "Jadwal berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete schedule error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus jadwal",
    };
  }
}

export async function deleteSchedulesByFieldAndDate(
  fieldId: string,
  date: string
): Promise<ApiResponse> {
  try {
    await requireAdmin();

    await prisma.schedule.deleteMany({
      where: {
        fieldId,
        date: new Date(date),
        status: { not: "BOOKED" },
      },
    });

    return {
      success: true,
      message: "Jadwal berhasil dihapus",
    };
  } catch (error) {
    console.error("Delete schedules error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus jadwal",
    };
  }
}
