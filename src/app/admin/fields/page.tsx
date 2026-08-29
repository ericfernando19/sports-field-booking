import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllFields } from "@/actions/field.actions";
import { formatCurrency } from "@/lib/utils";
import { FieldActions } from "@/components/admin/field-actions";

const sportTypeLabels: Record<string, string> = {
  FUTSAL: "Futsal",
  BADMINTON: "Bulu Tangkis",
  BASKETBALL: "Basket",
  TENNIS: "Tenis",
  VOLLEYBALL: "Voli",
  MINI_SOCCER: "Mini Soccer",
};

interface AdminFieldsPageProps {
  searchParams: Promise<{
    search?: string;
    sportType?: string;
    page?: string;
  }>;
}

export default async function AdminFieldsPage({ searchParams }: AdminFieldsPageProps) {
  const params = await searchParams;
  const result = await getAllFields({
    search: params.search,
    sportType: params.sportType,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Lapangan</h1>
          <p className="text-muted-foreground">
            {result.total} lapangan terdaftar
          </p>
        </div>
        <Button render={<Link href="/admin/fields/new" />} nativeButton={false}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Lapangan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Harga/Jam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.length > 0 ? (
                result.items.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {sportTypeLabels[field.sportType] || field.sportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {field.location}
                    </TableCell>
                    <TableCell>{formatCurrency(field.pricePerHour)}</TableCell>
                    <TableCell>
                      <Badge variant={field.isActive ? "default" : "destructive"}>
                        {field.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <FieldActions field={field} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Belum ada lapangan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === result.page ? "default" : "outline"}
                size="sm"
                render={
                  <Link
                    href={`/admin/fields?${new URLSearchParams({
                      ...(params.search ? { search: params.search } : {}),
                      ...(params.sportType ? { sportType: params.sportType } : {}),
                      page: String(page),
                    }).toString()}`}
                  />
                }
              >
                {page}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
