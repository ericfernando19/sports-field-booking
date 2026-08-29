import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Users, CalendarDays, CreditCard, TrendingUp, Clock, Loader2 } from "lucide-react";
import { getDashboardStats, getRecentBookings } from "@/actions/admin.actions";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Lapangan</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFields}</div>
          <p className="text-xs text-muted-foreground">lapangan aktif</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total User</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Booking Hari Ini</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayBookings}</div>
          <p className="text-xs text-muted-foreground">booking</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Booking Bulan Ini</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyBookings}</div>
          <p className="text-xs text-muted-foreground">booking</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">dari pembayaran lunas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">menunggu pembayaran</p>
        </CardContent>
      </Card>
    </div>
  );
}

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

async function RecentBookings() {
  const bookings = await getRecentBookings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Belum ada booking terbaru.
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">
                      {booking.bookingCode}
                    </span>
                    <Badge className={statusColors[booking.status]}>
                      {statusLabels[booking.status]}
                    </Badge>
                  </div>
                  <p className="text-sm">{booking.field.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.user.name} •{" "}
                    {new Date(booking.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(booking.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di panel admin SportBook</p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        }
      >
        <RecentBookings />
      </Suspense>
    </div>
  );
}
