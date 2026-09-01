"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllBookingsAdmin } from "@/actions/admin.actions";
import { formatCurrency, cn } from "@/lib/utils";
import { type PaginatedResponse } from "@/types";

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

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "ALL";
  const page = parseInt(searchParams.get("page") || "1");

  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const result = await getAllBookingsAdmin({
          page,
          pageSize: 10,
          status: tab === "ALL" ? undefined : tab,
          search,
        });
        setData(result);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [tab, page, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/bookings?tab=${tab}&page=1`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kelola Booking</h1>
        <p className="text-muted-foreground">Lihat dan kelola semua booking</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode booking, nama, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "ALL", label: "Semua" },
          { value: "CONFIRMED", label: "Dikonfirmasi" },
          { value: "PENDING", label: "Menunggu" },
          { value: "CANCELLED", label: "Dibatalkan" },
        ].map((item) => (
          <Link
            key={item.value}
            href={`/admin/bookings?tab=${item.value}`}
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

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data && data.items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada booking ditemukan.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Kode</th>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Lapangan</th>
                      <th className="text-left p-3 font-medium">Tanggal</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Pembayaran</th>
                      <th className="text-right p-3 font-medium">Total</th>
                      <th className="text-right p-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.items.map((booking: any) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="p-3 font-mono font-bold">
                          {booking.bookingCode}
                        </td>
                        <td className="p-3">
                          <div>{booking.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.user.email}
                          </div>
                        </td>
                        <td className="p-3">{booking.field.name}</td>
                        <td className="p-3">
                          {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3">
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {paymentStatusLabels[booking.payment?.status || "PENDING"]}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="p-3 text-right">
                            <Button variant="ghost" size="icon" render={<Link href={`/admin/bookings/${booking.id}`} />} nativeButton={false}>
                              <Eye className="h-4 w-4" />
                            </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data!.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: data!.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={p === data!.totalPages ? "default" : "outline"}
                      size="sm"
                      render={<Link href={`/admin/bookings?tab=${tab}&page=${p}`} />}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
