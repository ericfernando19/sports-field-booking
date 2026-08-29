"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { type DashboardStats, type PaginatedResponse } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [totalFields, totalUsers, todayBookings, monthlyBookings, monthlyRevenue, pendingPayments] =
    await Promise.all([
      prisma.field.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.booking.count({
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.booking.count({
        where: {
          bookingDate: { gte: startOfMonth, lte: endOfMonth },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: { status: "PENDING" },
      }),
    ]);

  return {
    totalFields,
    totalUsers,
    todayBookings,
    monthlyBookings,
    monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
    pendingPayments,
  };
}

export async function getRecentBookings() {
  await requireAdmin();

  const bookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      field: {
        select: { name: true, sportType: true },
      },
      user: {
        select: { name: true, email: true },
      },
      payment: {
        select: { status: true },
      },
    },
  });

  return bookings;
}

export async function getAllBookingsAdmin(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<any>> {
  await requireAdmin();

  const { page = 1, pageSize = 10, status, search } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { bookingCode: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
      { field: { name: { contains: search } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        field: {
          select: { name: true, sportType: true },
        },
        user: {
          select: { name: true, email: true },
        },
        payment: {
          select: { status: true, method: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAllUsersAdmin(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<any>> {
  await requireAdmin();

  const { page = 1, pageSize = 10, search } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
