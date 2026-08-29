export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 22
): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      startTime: `${hour.toString().padStart(2, "0")}:00`,
      endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
    });
  }

  return slots;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseInt(startTime.split(":")[0]);
  const end = parseInt(endTime.split(":")[0]);
  return end - start;
}

export function isSlotAvailable(
  slotStatus: string
): boolean {
  return slotStatus === "AVAILABLE";
}

export function canCancelBooking(bookingDate: Date, startTime: string): boolean {
  const now = new Date();
  const [hours] = startTime.split(":").map(Number);
  const bookingStart = new Date(bookingDate);
  bookingStart.setHours(hours, 0, 0, 0);

  return bookingStart > now;
}
