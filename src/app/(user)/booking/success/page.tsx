"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { getBookingByCode } from "@/actions/booking.actions";
import { formatCurrency } from "@/lib/utils";
import { type BookingWithDetails } from "@/types";
import { PaymentButton } from "@/components/booking/payment-button";

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!code) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getBookingByCode(code);
        setBooking(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [code]);

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

  if (!booking) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Booking tidak ditemukan.</p>
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
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              </div>

              <h1 className="text-2xl font-bold mb-2">Booking Berhasil!</h1>
              <p className="text-muted-foreground mb-6">
                Booking Anda telah berhasil dibuat.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Kode Booking
                  </span>
                  <span className="font-mono font-bold">
                    {booking.bookingCode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Lapangan
                  </span>
                  <span className="font-medium">{booking.field.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jam</span>
                  <span className="font-medium">
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Status Pembayaran
                  </span>
                  <span className="font-medium text-amber-600">
                    {booking.payment?.status || "PENDING"}
                  </span>
                </div>
              </div>

              {booking.payment?.status === "PENDING" && (
                <div className="mb-6">
                  <PaymentButton
                    bookingId={booking.id}
                    amount={booking.totalPrice}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button render={<Link href={`/bookings/${booking.id}`} />} nativeButton={false}>
                  Lihat Detail Booking
                </Button>
                <Button variant="outline" render={<Link href="/fields" />} nativeButton={false}>
                  Kembali ke Lapangan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
