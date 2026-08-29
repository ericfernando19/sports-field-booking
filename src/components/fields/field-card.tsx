import Link from "next/link";
import { MapPin, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { FieldWithSchedules } from "@/types";

const sportTypeLabels: Record<string, string> = {
  FUTSAL: "Futsal",
  BADMINTON: "Bulu Tangkis",
  BASKETBALL: "Basket",
  TENNIS: "Tenis",
  VOLLEYBALL: "Voli",
  MINI_SOCCER: "Mini Soccer",
};

const sportTypeColors: Record<string, string> = {
  FUTSAL: "bg-green-100 text-green-800",
  BADMINTON: "bg-blue-100 text-blue-800",
  BASKETBALL: "bg-orange-100 text-orange-800",
  TENNIS: "bg-yellow-100 text-yellow-800",
  VOLLEYBALL: "bg-purple-100 text-purple-800",
  MINI_SOCCER: "bg-red-100 text-red-800",
};

const sportTypeImages: Record<string, string> = {
  FUTSAL: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80",
  BASKETBALL: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
  TENNIS: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  VOLLEYBALL: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=600&q=80",
  MINI_SOCCER: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
};

interface FieldCardProps {
  field: FieldWithSchedules;
}

export function FieldCard({ field }: FieldCardProps) {
  const imageUrl = field.image || sportTypeImages[field.sportType] || null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${sportTypeColors[field.sportType] || "bg-gray-100 text-gray-800"}`}
        >
          {sportTypeLabels[field.sportType] || field.sportType}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{field.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{field.location}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(field.pricePerHour)}
            </span>
            <span className="text-sm text-muted-foreground"> / jam</span>
          </div>
          <Button render={<Link href={`/fields/${field.slug}`} />} size="sm" nativeButton={false}>
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
