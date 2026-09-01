"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/permissions";
import { type ApiResponse } from "@/types";

export async function submitPaymentProof(data: {
  bookingId: string;
  proofImage: string;
  bankName?: string;
  accountName?: string;
  notes?: string;
}): Promise<ApiResponse> {
  try {
    const user = await requireAuth();

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return { success: false, message: "Booking tidak ditemukan" };
    }

    if (booking.userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (!booking.payment) {
      return { success: false, message: "Pembayaran belum dibuat" };
    }

    if (booking.payment.status !== "PENDING") {
      return { success: false, message: "Pembayaran sudah diproses" };
    }

    await prisma.payment.update({
      where: { bookingId: data.bookingId },
      data: {
        status: "WAITING_CONFIRMATION",
        proofImage: data.proofImage,
        bankName: data.bankName,
        accountName: data.accountName,
        notes: data.notes || null,
        method: "BANK_TRANSFER",
        transactionId: `TRF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });

    return {
      success: true,
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi admin.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}

export async function verifyPayment(
  bookingId: string,
  action: "approve" | "reject"
): Promise<ApiResponse> {
  try {
    const admin = await requireAdmin();

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      return { success: false, message: "Pembayaran tidak ditemukan" };
    }

    if (payment.status !== "WAITING_CONFIRMATION") {
      return { success: false, message: "Pembayaran tidak dalam status menunggu verifikasi" };
    }

    if (action === "approve") {
      await prisma.payment.update({
        where: { bookingId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      return {
        success: true,
        message: "Pembayaran berhasil diverifikasi",
      };
    } else {
      await prisma.payment.update({
        where: { bookingId },
        data: {
          status: "FAILED",
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      });

      return {
        success: true,
        message: "Pembayaran ditolak",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}

export async function getPendingPayments(): Promise<
  ApiResponse<
    Array<{
      id: string;
      bookingId: string;
      amount: number;
      status: string;
      proofImage: string | null;
      bankName: string | null;
      accountName: string | null;
      notes: string | null;
      createdAt: Date;
      booking: {
        bookingCode: string;
        bookingDate: Date;
        startTime: string;
        endTime: string;
        user: { name: string; email: string };
        field: { name: string };
      };
    }>
  >
> {
  try {
    await requireAdmin();

    const payments = await prisma.payment.findMany({
      where: {
        status: { in: ["PENDING", "WAITING_CONFIRMATION"] },
      },
      orderBy: { createdAt: "asc" },
      include: {
        booking: {
          select: {
            bookingCode: true,
            bookingDate: true,
            startTime: true,
            endTime: true,
            user: { select: { name: true, email: true } },
            field: { select: { name: true } },
          },
        },
      },
    });

    return {
      success: true,
      message: "Data pembayaran",
      data: payments,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}

export async function getPaymentStatus(
  bookingId: string
): Promise<ApiResponse<{ status: string }>> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      select: { status: true },
    });

    if (!payment) {
      return { success: false, message: "Pembayaran tidak ditemukan" };
    }

    return {
      success: true,
      message: "Status pembayaran",
      data: { status: payment.status },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}
