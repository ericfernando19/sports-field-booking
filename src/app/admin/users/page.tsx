"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllUsersAdmin } from "@/actions/admin.actions";
import { type PaginatedResponse } from "@/types";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  USER: "User",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  USER: "bg-blue-100 text-blue-800",
};

function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const result = await getAllUsersAdmin({
          page,
          pageSize: 10,
          search,
        });
        setData(result);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [page, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/users?page=1`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada user ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Booking</th>
                    <th className="text-left p-3 font-medium">Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.items.map((user: any) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {user.role === "ADMIN" ? (
                              <Shield className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">
                          {user._count.bookings}
                        </span>{" "}
                        booking
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data!.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: data!.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Button
                    key={p}
                    variant={p === data!.totalPages ? "default" : "outline"}
                    size="sm"
                    render={<Link href={`/admin/users?page=${p}`} />}
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
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
