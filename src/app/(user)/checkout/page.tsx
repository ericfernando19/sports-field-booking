"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { getSchedulesByFieldAndDate } from "@/actions/schedule.actions";
import { createBooking } from "@/actions/booking.actions";
import { getFieldById } from "@/actions/field.actions";
import { formatCurrency } from "@/lib/utils";
import { type FieldWithSchedules, type ScheduleWithStatus } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fieldId = searchParams.get("fieldId");
  const date = searchParams.get("date");
  const scheduleIdsParam = searchParams.get("scheduleIds");

  const [field, setField] = useState<FieldWithSchedules | null>(null);
  const [schedules, setSchedules] = useState<ScheduleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!fieldId || !date || !scheduleIdsParam) {
        setIsLoading(false);
        return;
      }

      try {
        const scheduleIds = scheduleIdsParam.split(",");
        const [fieldData, schedulesData] = await Promise.all([
          getFieldById(fieldId),
          getSchedulesByFieldAndDate(fieldId, date),
        ]);

        setField(fieldData);
        setSchedules(
          schedulesData.filter((s) => scheduleIds.includes(s.id))
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [fieldId, date, scheduleIdsParam]);

  const total = schedules.reduce((sum, s) => sum + s.price, 0);
  const duration = schedules.length;
  const firstSchedule = schedules[0];
  const lastSchedule = schedules[schedules.length - 1];

  async function handleBooking() {
    if (!fieldId || !date || !scheduleIdsParam) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createBooking({
        fieldId,
        scheduleIds: scheduleIdsParam.split(","),
        bookingDate: date,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(
        `/booking/success?code=${result.data?.bookingCode}`
      );
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!field || !date || schedules.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Data booking tidak valid.</p>
          <Button onClick={() => router.push("/fields")} className="mt-4">
            Kembali ke Lapangan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lapangan</span>
                  <span className="font-medium">{field.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {format(new Date(date), "dd MMMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jam</span>
                  <span className="font-medium">
                    {firstSchedule?.startTime} - {lastSchedule?.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Durasi</span>
                  <span className="font-medium">{duration} jam</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Jadwal:</span>
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span>
                        {s.startTime} - {s.endTime}
                      </span>
                      <span>{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    Saya menyetujui syarat dan ketentuan booking. Saya memahami
                    bahwa pembatalan harus dilakukan minimal 24 jam sebelum
                    jadwal.
                  </span>
                </label>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Kembali
              </Button>
              <Button
                onClick={handleBooking}
                disabled={isSubmitting || !agreed}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Buat Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
