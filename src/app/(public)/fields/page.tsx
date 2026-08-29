import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { FieldCard } from "@/components/fields/field-card";
import { FieldFilters } from "@/components/fields/field-filters";
import { getFields } from "@/actions/field.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface FieldsPageProps {
  searchParams: Promise<{
    search?: string;
    sportType?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function FieldsPage({ searchParams }: FieldsPageProps) {
  const params = await searchParams;
  const result = await getFields({
    search: params.search,
    sportType: params.sportType,
    sortBy: params.sortBy,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 12,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lapangan Olahraga</h1>
          <p className="text-muted-foreground mt-2">
            Temukan lapangan olahraga terbaik untuk Anda
          </p>
        </div>

        <Suspense fallback={<div>Memuat filter...</div>}>
          <FieldFilters />
        </Suspense>

        <div className="mt-8">
          {result.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.items.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={page === result.page ? "default" : "outline"}
                        size="sm"
                        render={
                          <Link
                            href={`/fields?${new URLSearchParams({
                              ...(params.search ? { search: params.search } : {}),
                              ...(params.sportType
                                ? { sportType: params.sportType }
                                : {}),
                              ...(params.sortBy ? { sortBy: params.sortBy } : {}),
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
            </>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg">
                  Tidak ada lapangan ditemukan.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Coba ubah filter pencarian Anda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
