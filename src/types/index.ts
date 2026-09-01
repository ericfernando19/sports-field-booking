export type Role = "USER" | "ADMIN";

export type SportType =
  | "FUTSAL"
  | "BADMINTON"
  | "BASKETBALL"
  | "TENNIS"
  | "VOLLEYBALL"
  | "MINI_SOCCER";

export type ScheduleStatus = "AVAILABLE" | "BLOCKED" | "BOOKED";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type PaymentStatus =
  | "PENDING"
  | "WAITING_CONFIRMATION"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

export type PaymentMethod =
  | "MOCK"
  | "BANK_TRANSFER"
  | "QRIS"
  | "EWALLET";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface FieldWithSchedules {
  id: string;
  name: string;
  slug: string;
  sportType: SportType;
  description: string | null;
  location: string;
  pricePerHour: number;
  facilities: string | null;
  image: string | null;
  isActive: boolean;
  schedules?: ScheduleWithStatus[];
}

export interface ScheduleWithStatus {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  status: ScheduleStatus;
}

export interface BookingWithDetails {
  id: string;
  bookingCode: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  subtotal: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  field: {
    name: string;
    sportType: SportType;
    location: string;
  };
  payment?: {
    status: PaymentStatus;
    method: PaymentMethod;
    proofImage?: string | null;
    bankName?: string | null;
    accountName?: string | null;
  } | null;
}

export interface DashboardStats {
  totalFields: number;
  totalUsers: number;
  todayBookings: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  pendingPayments: number;
}
