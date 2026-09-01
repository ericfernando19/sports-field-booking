import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Dumbbell, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFieldBySlug } from "@/actions/field.actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const sportTypeLabels: Record<string, string> = {
  FUTSAL: "Futsal",
  BADMINTON: "Bulu Tangkis",
  BASKETBALL: "Basket",
  TENNIS: "Tenis",
  VOLLEYBALL: "Voli",
  MINI_SOCCER: "Mini Soccer",
};

const sportTypeImages: Record<string, string> = {
  FUTSAL: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  BASKETBALL: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  TENNIS: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  VOLLEYBALL: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
  MINI_SOCCER: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
};

interface FieldDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FieldDetailPage({ params }: FieldDetailPageProps) {
  const { id: slug } = await params;
  const field = await getFieldBySlug(slug);

  if (!field) {
    notFound();
  }

  const facilities = field.facilities
    ? field.facilities.split(",").map((f) => f.trim())
    : [];

  const imageUrl = field.image || sportTypeImages[field.sportType] || null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={field.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Dumbbell className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{field.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {sportTypeLabels[field.sportType] || field.sportType}
                    </Badge>
                    {!field.isActive && (
                      <Badge variant="destructive">Tidak Tersedia</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-3">
                <MapPin className="h-5 w-5" />
                <span>{field.location}</span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {field.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Deskripsi</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {field.description}
                </p>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Fasilitas</h2>
                <div className="grid grid-cols-2 gap-2">
                  {facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground">Harga per jam</p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {formatCurrency(field.pricePerHour)}
                  </p>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Jenis Olahraga</span>
                    <span className="font-medium">
                      {sportTypeLabels[field.sportType] || field.sportType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lokasi</span>
                    <span className="font-medium text-right max-w-[200px] line-clamp-1">
                      {field.location}
                    </span>
                  </div>
                </div>

                {field.isActive ? (
                  <Button render={<Link href={`/booking/${field.id}`} />} className="w-full" size="lg" nativeButton={false}>
                    Booking Sekarang
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    Tidak Tersedia
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Pembatalan gratis hingga 24 jam sebelum jadwal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
