import { z } from "zod";

export const bookingSchema = z.object({
  fieldId: z.string().min(1, "Lapangan harus dipilih"),
  scheduleIds: z
    .array(z.string())
    .min(1, "Minimal satu jadwal harus dipilih"),
  bookingDate: z.string().min(1, "Tanggal booking harus diisi"),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID harus diisi"),
  reason: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
