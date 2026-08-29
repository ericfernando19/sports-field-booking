import { z } from "zod";

export const scheduleSchema = z.object({
  fieldId: z.string().min(1, "Lapangan harus dipilih"),
  date: z.string().min(1, "Tanggal harus diisi"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, "Format jam harus HH:00"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):00$/, "Format jam harus HH:00"),
  price: z.number().min(1000, "Harga minimal Rp 1.000"),
  status: z.enum(["AVAILABLE", "BLOCKED"]).default("AVAILABLE"),
}).refine(
  (data) => {
    const start = parseInt(data.startTime.split(":")[0]);
    const end = parseInt(data.endTime.split(":")[0]);
    return end > start;
  },
  {
    message: "Jam selesai harus lebih besar dari jam mulai",
    path: ["endTime"],
  }
);

export const bulkScheduleSchema = z.object({
  fieldId: z.string().min(1, "Lapangan harus dipilih"),
  dates: z.array(z.string()).min(1, "Minimal satu tanggal harus dipilih"),
  timeSlots: z
    .array(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .min(1, "Minimal satu slot waktu harus dipilih"),
  status: z.enum(["AVAILABLE", "BLOCKED"]).default("AVAILABLE"),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type BulkScheduleInput = z.infer<typeof bulkScheduleSchema>;
