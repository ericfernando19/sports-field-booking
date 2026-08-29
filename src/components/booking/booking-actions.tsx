"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelBooking } from "@/actions/booking.actions";
import { type BookingWithDetails } from "@/types";
import { canCancelBooking } from "@/lib/booking";

interface BookingActionsProps {
  booking: BookingWithDetails;
}

export function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canCancel =
    booking.status === "CONFIRMED" &&
    canCancelBooking(booking.bookingDate, booking.startTime);

  async function handleCancel() {
    setIsLoading(true);
    try {
      const result = await cancelBooking({ bookingId: booking.id });
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
      setShowCancelDialog(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link href={`/bookings/${booking.id}`} />} nativeButton={false}>
          <Eye className="h-4 w-4" />
        </Button>
        {canCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            Batalkan
          </Button>
        )}
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Booking?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan booking{" "}
              <strong>{booking.bookingCode}</strong>? Dana akan dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isLoading}
            >
              Tidak
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
