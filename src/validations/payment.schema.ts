import { z } from "zod";

export const paymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID harus diisi"),
  method: z.enum(["BANK_TRANSFER", "QRIS", "EWALLET"]).default("BANK_TRANSFER"),
});

export const submitProofSchema = z.object({
  bookingId: z.string().min(1, "Booking ID harus diisi"),
  proofImage: z.string().min(1, "Bukti transfer harus diupload"),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID harus diisi"),
  action: z.enum(["approve", "reject"]),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type SubmitProofInput = z.infer<typeof submitProofSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
