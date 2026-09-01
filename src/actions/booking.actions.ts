"use server";

import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/permissions";
import { bookingSchema, cancelBookingSchema, type BookingInput, type CancelBookingInput } from "@/validations/booking.schema";
import { type ApiResponse, type BookingWithDetails } from "@/types";
import { generateBookingCode } from "@/lib/utils";
import { canCancelBooking } from "@/lib/booking";

export async function createBooking(
  data: BookingInput
): Promise<ApiResponse<{ bookingId: string; bookingCode: string }>> {
  try {
    const user = await requireAuth();

    const validated = bookingSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const { fieldId, scheduleIds, bookingDate } = validated.data;

    const field = await prisma.field.findUnique({ where: { id: fieldId } });
    if (!field || !field.isActive) {
      return {
        success: false,
        message: "Lapangan tidak tersedia",
      };
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        id: { in: scheduleIds },
        fieldId,
        date: new Date(bookingDate),
      },
    });

    if (schedules.length !== scheduleIds.length) {
      return {
        success: false,
        message: "Beberapa jadwal tidak valid",
      };
    }

    const unavailable = schedules.filter((s) => s.status !== "AVAILABLE");
    if (unavailable.length > 0) {
      return {
        success: false,
        message: "Beberapa jadwal sudah tidak tersedia",
      };
    }

    const bookingCode = generateBookingCode();
    const duration = schedules.length;
    const subtotal = schedules.reduce((sum, s) => sum + s.price, 0);
    const totalPrice = subtotal;

    const firstSchedule = schedules[0];
    const lastSchedule = schedules[schedules.length - 1];

    const result = await prisma.$transaction(async (tx) => {
      const recheckSchedules = await tx.schedule.findMany({
        where: {
          id: { in: scheduleIds },
          status: "AVAILABLE",
        },
      });

      if (recheckSchedules.length !== scheduleIds.length) {
        throw new Error("SCHEDULE_NO_LONGER_AVAILABLE");
      }

      await tx.schedule.updateMany({
        where: { id: { in: scheduleIds } },
        data: { status: "BOOKED" },
      });

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          userId: user.id,
          fieldId,
          bookingDate: new Date(bookingDate),
          startTime: firstSchedule.startTime,
          endTime: lastSchedule.endTime,
          duration,
          subtotal,
          totalPrice,
          status: "PENDING",
        },
      });

      await tx.bookingItem.createMany({
        data: schedules.map((s) => ({
          bookingId: booking.id,
          scheduleId: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          price: s.price,
        })),
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          method: "BANK_TRANSFER",
          status: "PENDING" as const,
        },
      });

      return { bookingId: booking.id, bookingCode: booking.bookingCode };
    });

    return {
      success: true,
      message: "Booking berhasil dibuat",
      data: result,
    };
  } catch (error) {
    console.error("Create booking error:", error);

    if (error instanceof Error && error.message === "SCHEDULE_NO_LONGER_AVAILABLE") {
      return {
        success: false,
        message: "Beberapa jadwal baru saja dibooking orang lain. Silakan pilih jadwal lain.",
      };
    }

    return {
      success: false,
      message: "Terjadi kesalahan saat membuat booking",
    };
  }
}

export async function getMyBookings(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: BookingWithDetails[]; total: number; totalPages: number }> {
  const user = await requireAuth();
  const { status, page = 1, pageSize = 10 } = params || {};

  const where: any = { userId: user.id };

  if (status && status !== "ALL") {
    where.status = status as any;
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        field: {
          select: { name: true, sportType: true, location: true },
        },
        payment: {
          select: { status: true, method: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items as BookingWithDetails[],
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAllBookings(params?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: BookingWithDetails[]; total: number; totalPages: number }> {
  await requireAdmin();

  const { search, status, paymentStatus, page = 1, pageSize = 10 } = params || {};

  const where: any = {};

  if (search) {
    where.OR = [
      { bookingCode: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status as any;
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    where.payment = { status: paymentStatus as any };
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        field: {
          select: { name: true, sportType: true, location: true },
        },
        user: {
          select: { name: true, email: true },
        },
        payment: {
          select: { status: true, method: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: items as BookingWithDetails[],
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      field: {
        select: { name: true, sportType: true, location: true },
      },
      items: {
        include: {
          schedule: true,
        },
      },
      payment: {
        select: { status: true, method: true, transactionId: true, proofImage: true, bankName: true, accountName: true },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!booking) return null;

  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    return null;
  }

  return booking as BookingWithDetails;
}

export async function cancelBooking(
  data: CancelBookingInput
): Promise<ApiResponse> {
  try {
    const user = await requireAuth();

    const validated = cancelBookingSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: "Validasi gagal",
      };
    }

    const { bookingId } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true },
    });

    if (!booking) {
      return {
        success: false,
        message: "Booking tidak ditemukan",
      };
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Tidak memiliki akses",
      };
    }

    if (booking.status !== "CONFIRMED") {
      return {
        success: false,
        message: "Hanya booking yang sudah dikonfirmasi yang dapat dibatalkan",
      };
    }

    if (!canCancelBooking(booking.bookingDate, booking.startTime)) {
      return {
        success: false,
        message: "Tidak dapat membatalkan booking yang sudah dimulai",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      await tx.payment.updateMany({
        where: { bookingId },
        data: { status: "REFUNDED" },
      });

      await tx.schedule.updateMany({
        where: {
          id: { in: booking.items.map((item) => item.scheduleId) },
        },
        data: { status: "AVAILABLE" },
      });
    });

    return {
      success: true,
      message: "Booking berhasil dibatalkan",
    };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat membatalkan booking",
    };
  }
}

export async function getBookingByCode(
  bookingCode: string
): Promise<BookingWithDetails | null> {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: {
      field: {
        select: { name: true, sportType: true, location: true },
      },
      items: {
        include: {
          schedule: true,
        },
      },
      payment: {
        select: { status: true, method: true, transactionId: true, proofImage: true, bankName: true, accountName: true },
      },
    },
  });

  if (!booking) return null;

  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    return null;
  }

  return booking as BookingWithDetails;
}
