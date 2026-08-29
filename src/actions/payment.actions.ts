"use server";

import { prisma } from "@/lib/prisma";
import { paymentProvider } from "@/lib/payment/mock-provider";
import { requireAuth } from "@/lib/permissions";
import { paymentSchema, simulatePaymentSchema } from "@/validations/payment.schema";
import { type ApiResponse } from "@/types";

export async function createPayment(data: {
  bookingId: string;
  method?: string;
}): Promise<ApiResponse<{ transactionId: string }>> {
  try {
    const user = await requireAuth();

    const validated = paymentSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, message: "Data tidak valid" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: validated.data.bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return { success: false, message: "Booking tidak ditemukan" };
    }

    if (booking.userId !== user.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (booking.payment && booking.payment.status !== "PENDING") {
      return { success: false, message: "Pembayaran sudah diproses" };
    }

    const result = await paymentProvider.createPayment({
      bookingId: booking.id,
      amount: Number(booking.totalPrice),
      method: validated.data.method,
    });

    if (!result.success) {
      return { success: false, message: result.message };
    }

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        transactionId: result.transactionId,
        method: validated.data.method as any,
        amount: Number(booking.totalPrice),
        status: "PENDING",
      },
      create: {
        bookingId: booking.id,
        transactionId: result.transactionId,
        method: validated.data.method as any,
        amount: Number(booking.totalPrice),
        status: "PENDING",
      },
    });

    return {
      success: true,
      message: "Pembayaran berhasil dibuat",
      data: { transactionId: result.transactionId },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}

export async function simulatePaymentSuccess(
  bookingId: string
): Promise<ApiResponse> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      return { success: false, message: "Transaksi tidak ditemukan" };
    }

    if (payment.status !== "PENDING") {
      return { success: false, message: "Transaksi sudah diproses" };
    }

    if (!payment.transactionId) {
      return { success: false, message: "Transaction ID tidak ditemukan" };
    }

    const status = await paymentProvider.simulatePayment(payment.transactionId);

    await prisma.payment.update({
      where: { bookingId },
      data: {
        status: "PAID",
        paidAt: status.paidAt,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    return {
      success: true,
      message: "Pembayaran berhasil",
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
): Promise<ApiResponse<{ status: string; paidAt?: Date }>> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      select: { status: true, paidAt: true, transactionId: true },
    });

    if (!payment) {
      return { success: false, message: "Pembayaran tidak ditemukan" };
    }

    if (!payment.transactionId) {
      return { success: false, message: "Transaction ID tidak ditemukan" };
    }

    const providerStatus = await paymentProvider.getPaymentStatus(
      payment.transactionId
    );

    if (providerStatus.status !== payment.status) {
      await prisma.payment.update({
        where: { bookingId },
        data: {
          status: providerStatus.status as any,
          paidAt: providerStatus.paidAt,
        },
      });

      if (providerStatus.status === "PAID") {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });
      }
    }

    return {
      success: true,
      message: "Status pembayaran",
      data: {
        status: providerStatus.status,
        paidAt: providerStatus.paidAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan",
    };
  }
}
