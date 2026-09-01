import { Suspense } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyBookings } from "@/actions/booking.actions";
import { formatCurrency } from "@/lib/utils";
import { BookingActions } from "@/components/booking/booking-actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  PENDING: "Menunggu",
  WAITING_CONFIRMATION: "Verifikasi",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  REFUNDED: "Dikembalikan",
};

interface BookingsPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

async function BookingsList({ tab, page }: { tab: string; page: string }) {
  const result = await getMyBookings({
    status: tab === "ALL" ? undefined : tab,
    page: parseInt(page),
    pageSize: 10,
  });

  if (result.items.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada booking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {result.items.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">
                    {booking.bookingCode}
                  </span>
                  <Badge className={statusColors[booking.status]}>
                    {statusLabels[booking.status]}
                  </Badge>
                </div>
                <p className="text-sm">{booking.field.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  | {booking.startTime} - {booking.endTime}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(booking.totalPrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    {paymentStatusLabels[booking.payment?.status || "PENDING"]}
                  </p>
                </div>
                <BookingActions booking={booking} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Button
                key={p}
                variant={p === result.totalPages ? "default" : "outline"}
                size="sm"
                render={<Link href={`/bookings?tab=${tab}&page=${p}`} />}
              >
                {p}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const tab = params.tab || "ALL";
  const page = params.page || "1";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Booking Saya</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "ALL", label: "Semua" },
            { value: "CONFIRMED", label: "Upcoming" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ].map((item) => (
            <Link
              key={item.value}
              href={`/bookings?tab=${item.value}`}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === item.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Suspense fallback={<div>Memuat...</div>}>
          <BookingsList tab={tab} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
