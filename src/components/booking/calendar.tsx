"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  disabledBefore?: Date;
}

export function Calendar({ selectedDate, onDateSelect, disabledBefore }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const minDate = disabledBefore || startOfDay(new Date());

  const startDayOfWeek = getDay(monthStart);
  const blankDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  function handlePrevMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function handleDateClick(date: Date) {
    if (isBefore(date, minDate)) return;
    onDateSelect(date);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: id })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blankDays.map((i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const isDisabled = isBefore(day, minDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                h-9 w-full rounded-lg text-sm font-medium transition-colors
                ${isDisabled ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-primary/10 cursor-pointer"}
                ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                ${isToday && !isSelected ? "border border-primary" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
