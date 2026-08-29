"use client";

import { Clock, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ScheduleWithStatus } from "@/types";

interface TimeSlotProps {
  schedule: ScheduleWithStatus;
  isSelected?: boolean;
  onSelect?: (schedule: ScheduleWithStatus) => void;
  showPrice?: boolean;
}

export function TimeSlot({ schedule, isSelected, onSelect, showPrice = true }: TimeSlotProps) {
  const isAvailable = schedule.status === "AVAILABLE";
  const isBooked = schedule.status === "BOOKED";
  const isBlocked = schedule.status === "BLOCKED";
  const isDisabled = !isAvailable;

  function handleClick() {
    if (isDisabled || !onSelect) return;
    onSelect(schedule);
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all
        ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary"}
        ${isSelected ? "border-primary bg-primary/5" : "border-border"}
        ${isBooked ? "bg-red-50 border-red-200" : ""}
        ${isBlocked ? "bg-gray-50 border-gray-200" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="text-left">
          <p className="font-medium text-sm">
            {schedule.startTime} - {schedule.endTime}
          </p>
          {showPrice && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(schedule.price)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isBooked && (
          <Badge variant="destructive" className="text-xs">
            Terbooking
          </Badge>
        )}
        {isBlocked && (
          <Badge variant="secondary" className="text-xs">
            Diblokir
          </Badge>
        )}
        {isAvailable && isSelected && (
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
        {isAvailable && !isSelected && (
          <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
        )}
      </div>
    </button>
  );
}

interface TimeSlotGridProps {
  schedules: ScheduleWithStatus[];
  selectedSchedules: ScheduleWithStatus[];
  onToggleSchedule: (schedule: ScheduleWithStatus) => void;
  showPrice?: boolean;
}

export function TimeSlotGrid({
  schedules,
  selectedSchedules,
  onToggleSchedule,
  showPrice = true,
}: TimeSlotGridProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Belum ada jadwal tersedia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {schedules.map((schedule) => {
        const isSelected = selectedSchedules.some((s) => s.id === schedule.id);
        return (
          <TimeSlot
            key={schedule.id}
            schedule={schedule}
            isSelected={isSelected}
            onSelect={onToggleSchedule}
            showPrice={showPrice}
          />
        );
      })}
    </div>
  );
}

interface TimeSlotSummaryProps {
  selectedSchedules: ScheduleWithStatus[];
  onRemove?: (schedule: ScheduleWithStatus) => void;
}

export function TimeSlotSummary({ selectedSchedules, onRemove }: TimeSlotSummaryProps) {
  const total = selectedSchedules.reduce((sum, s) => sum + s.price, 0);

  if (selectedSchedules.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Jadwal Dipilih</h4>
      <div className="space-y-2">
        {selectedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {schedule.startTime} - {schedule.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatCurrency(schedule.price)}</span>
              {onRemove && (
                <button
                  onClick={() => onRemove(schedule)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 flex items-center justify-between font-medium">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
