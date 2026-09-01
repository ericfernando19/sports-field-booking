import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CreditCard } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBookingById } from "@/actions/booking.actions";
import { formatCurrency } from "@/lib/utils";
import { BookingActions } from "@/components/booking/booking-actions";
import { PaymentButton } from "@/components/booking/payment-button";

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  CANCELLED: "Dibatalkan",
  COMPLETED: "Selesai",
  EXPIRED: "Kadaluarsa",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  WAITING_CONFIRMATION: "Menunggu Verifikasi",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  REFUNDED: "Dikembalikan",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "text-yellow-600",
  WAITING_CONFIRMATION: "text-amber-600",
  PAID: "text-green-600",
  FAILED: "text-red-600",
  EXPIRED: "text-gray-600",
  REFUNDED: "text-blue-600",
};

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" render={<Link href="/bookings" />} nativeButton={false} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Detail Booking</h1>
              <p className="font-mono text-muted-foreground mt-1">
                {booking.bookingCode}
              </p>
            </div>
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Lapangan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.field.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.field.location}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jadwal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jam</span>
                  <span className="font-medium">
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Durasi</span>
                  <span className="font-medium">{booking.duration} jam</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-sm font-medium">Detail Slot:</span>
                  {(booking as any).items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      <span>{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(booking.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Pembayaran</span>
                  <span
                    className={`font-medium ${
                      paymentStatusColors[booking.payment?.status || "PENDING"]
                    }`}
                  >
                    {paymentStatusLabels[booking.payment?.status || "PENDING"]}
                  </span>
                </div>
                {booking.payment?.method && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Metode</span>
                    <span className="font-medium">
                      {booking.payment.method}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {(booking.payment?.status === "PENDING" || booking.payment?.status === "WAITING_CONFIRMATION") && (
              <PaymentButton
                bookingId={booking.id}
                amount={booking.totalPrice}
                paymentStatus={booking.payment?.status}
              />
            )}

            <BookingActions booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
