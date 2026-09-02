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
  FUTSAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  BADMINTON: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  BASKETBALL: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  TENNIS: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  VOLLEYBALL: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  MINI_SOCCER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
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
      <div className="aspect-[4/3] bg-muted relative">
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
      <CardContent className="p-3">
        <h3 className="font-semibold text-base line-clamp-1">{field.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{field.location}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(field.pricePerHour)}
            </span>
            <span className="text-xs text-muted-foreground"> / jam</span>
          </div>
          <Button render={<Link href={`/fields/${field.slug}`} />} size="sm" nativeButton={false}>
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
