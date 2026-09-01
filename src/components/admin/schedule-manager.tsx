"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Lock, Unlock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Calendar } from "@/components/booking/calendar";
import { TimeSlot } from "@/components/booking/time-slots";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getSchedulesByFieldAndDate,
  blockSchedules,
  unblockSchedules,
  createBulkSchedule,
  deleteSchedulesByFieldAndDate,
} from "@/actions/schedule.actions";
import { type FieldWithSchedules, type ScheduleWithStatus } from "@/types";

interface AdminScheduleManagerProps {
  fields: FieldWithSchedules[];
}

const timeSlots = [
  { startTime: "08:00", endTime: "09:00" },
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "17:00" },
  { startTime: "17:00", endTime: "18:00" },
  { startTime: "18:00", endTime: "19:00" },
  { startTime: "19:00", endTime: "20:00" },
  { startTime: "20:00", endTime: "21:00" },
  { startTime: "21:00", endTime: "22:00" },
];

export function AdminScheduleManager({ fields }: AdminScheduleManagerProps) {
  const router = useRouter();
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [schedules, setSchedules] = useState<ScheduleWithStatus[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    async function loadSchedules() {
      if (!selectedField || !selectedDate) {
        setSchedules([]);
        return;
      }

      setIsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getSchedulesByFieldAndDate(selectedField, dateStr);
        setSchedules(data);
        setSelectedSchedules([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchedules();
  }, [selectedField, selectedDate]);

  function handleToggleSchedule(schedule: ScheduleWithStatus) {
    setSelectedSchedules((prev) => {
      const exists = prev.find((s) => s.id === schedule.id);
      if (exists) {
        return prev.filter((s) => s.id !== schedule.id);
      }
      return [...prev, schedule];
    });
  }

  async function handleBlockSelected() {
    if (selectedSchedules.length === 0) return;

    setIsActionLoading(true);
    try {
      const availableIds = selectedSchedules
        .filter((s) => s.status === "AVAILABLE")
        .map((s) => s.id);

      if (availableIds.length > 0) {
        await blockSchedules(availableIds);
      }

      // Refresh schedules
      if (selectedField && selectedDate) {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getSchedulesByFieldAndDate(selectedField, dateStr);
        setSchedules(data);
        setSelectedSchedules([]);
      }
      router.refresh();
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleUnblockSelected() {
    if (selectedSchedules.length === 0) return;

    setIsActionLoading(true);
    try {
      const blockedIds = selectedSchedules
        .filter((s) => s.status === "BLOCKED")
        .map((s) => s.id);

      if (blockedIds.length > 0) {
        await unblockSchedules(blockedIds);
      }

      if (selectedField && selectedDate) {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const data = await getSchedulesByFieldAndDate(selectedField, dateStr);
        setSchedules(data);
        setSelectedSchedules([]);
      }
      router.refresh();
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleCreateAllSlots() {
    if (!selectedField || !selectedDate) return;

    setIsActionLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      await createBulkSchedule({
        fieldId: selectedField,
        dates: [dateStr],
        timeSlots: timeSlots,
        status: "AVAILABLE",
      });

      const data = await getSchedulesByFieldAndDate(selectedField, dateStr);
      setSchedules(data);
      setShowCreateDialog(false);
      router.refresh();
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleDeleteAllSlots() {
    if (!selectedField || !selectedDate) return;

    setIsActionLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      await deleteSchedulesByFieldAndDate(selectedField, dateStr);

      setSchedules([]);
      setSelectedSchedules([]);
      router.refresh();
    } finally {
      setIsActionLoading(false);
    }
  }

  const availableCount = schedules.filter((s) => s.status === "AVAILABLE").length;
  const blockedCount = schedules.filter((s) => s.status === "BLOCKED").length;
  const bookedCount = schedules.filter((s) => s.status === "BOOKED").length;

  const selectedFieldName = fields.find((f) => f.id === selectedField)?.name || "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Lapangan</Label>
          <Select value={selectedField} onValueChange={(v) => setSelectedField(v || "")}>
            <SelectTrigger className="w-full min-h-10">
              {selectedFieldName || <span className="text-muted-foreground">Pilih lapangan</span>}
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id} className="py-2">
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>

      {selectedField && selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                Jadwal untuk{" "}
                {format(selectedDate, "dd MMMM yyyy", { locale: id })}
              </h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="default">{availableCount} Tersedia</Badge>
                <Badge variant="destructive">{blockedCount} Diblokir</Badge>
                <Badge variant="secondary">{bookedCount} Terbooking</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                disabled={isActionLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Buat Semua Slot
              </Button>
              {schedules.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAllSlots}
                  disabled={isActionLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Semua
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {schedules.map((schedule) => (
                  <TimeSlot
                    key={schedule.id}
                    schedule={schedule}
                    isSelected={selectedSchedules.some((s) => s.id === schedule.id)}
                    onSelect={handleToggleSchedule}
                  />
                ))}
              </div>

              {selectedSchedules.length > 0 && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBlockSelected}
                    disabled={isActionLoading}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Blokir ({selectedSchedules.filter((s) => s.status === "AVAILABLE").length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnblockSelected}
                    disabled={isActionLoading}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Buka ({selectedSchedules.filter((s) => s.status === "BLOCKED").length})
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada jadwal untuk tanggal ini.</p>
              <p className="text-sm mt-1">
                Klik &quot;Buat Semua Slot&quot; untuk membuat jadwal.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create All Slots Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Semua Slot?</DialogTitle>
            <DialogDescription>
              Ini akan membuat {timeSlots.length} slot waktu (08:00 - 22:00) untuk tanggal{" "}
              {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: id })}.
              Slot yang sudah ada tidak akan ditimpa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isActionLoading}
            >
              Batal
            </Button>
            <Button onClick={handleCreateAllSlots} disabled={isActionLoading}>
              {isActionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Buat Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
