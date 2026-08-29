import { z } from "zod";

export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID harus diisi"),
  method: z.enum(["MOCK", "BANK_TRANSFER", "QRIS", "EWALLET"]).default("MOCK"),
});

export const simulatePaymentSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID harus diisi"),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type SimulatePaymentInput = z.infer<typeof simulatePaymentSchema>;
