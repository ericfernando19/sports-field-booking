"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/booking/calendar";
import { TimeSlotGrid, TimeSlotSummary } from "@/components/booking/time-slots";
import { getSchedulesByFieldAndDate } from "@/actions/schedule.actions";
import { formatCurrency } from "@/lib/utils";
import { type FieldWithSchedules, type ScheduleWithStatus } from "@/types";

interface BookingClientProps {
  field: FieldWithSchedules;
}

export function BookingClient({ field }: BookingClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [schedules, setSchedules] = useState<ScheduleWithStatus[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSchedules() {
      if (!selectedDate) {
        setSchedules([]);
        setSelectedSchedules([]);
        return;
      }

      setIsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getSchedulesByFieldAndDate(field.id, dateStr);
        setSchedules(data);
        setSelectedSchedules([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchedules();
  }, [selectedDate, field.id]);

  function handleToggleSchedule(schedule: ScheduleWithStatus) {
    if (schedule.status !== "AVAILABLE") return;

    setSelectedSchedules((prev) => {
      const exists = prev.find((s) => s.id === schedule.id);
      if (exists) {
        return prev.filter((s) => s.id !== schedule.id);
      }
      return [...prev, schedule].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    });
  }

  function handleRemoveSchedule(schedule: ScheduleWithStatus) {
    setSelectedSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
  }

  function handleContinue() {
    if (selectedSchedules.length === 0 || !selectedDate) return;

    setIsSubmitting(true);

    const params = new URLSearchParams({
      fieldId: field.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      scheduleIds: selectedSchedules.map((s) => s.id).join(","),
    });

    router.push(`/checkout?${params.toString()}`);
  }

  const total = selectedSchedules.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Field Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                {field.image ? (
                  <img
                    src={field.image}
                    alt={field.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="font-semibold">{field.name}</h2>
                <p className="text-sm text-muted-foreground">{field.location}</p>
                <p className="text-sm font-medium text-primary">
                  {formatCurrency(field.pricePerHour)} / jam
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Pilih Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pilih Jam
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TimeSlotGrid
                  schedules={schedules}
                  selectedSchedules={selectedSchedules}
                  onToggleSchedule={handleToggleSchedule}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Ringkasan Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {format(selectedDate, "dd MMMM yyyy", { locale: id })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lapangan</span>
              <span className="font-medium">{field.name}</span>
            </div>

            <Separator />

            {selectedSchedules.length > 0 ? (
              <>
                <TimeSlotSummary
                  selectedSchedules={selectedSchedules}
                  onRemove={handleRemoveSchedule}
                />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinue}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Lanjutkan ke Checkout
                </Button>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {selectedDate
                    ? "Pilih minimal 1 jadwal"
                    : "Pilih tanggal terlebih dahulu"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
