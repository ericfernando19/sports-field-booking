import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function FieldCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

function FieldListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FieldCardSkeleton key={i} />
      ))}
    </div>
  );
}

function FieldDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

function BookingListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

function TimeSlotGridSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  FieldCardSkeleton,
  FieldListSkeleton,
  FieldDetailSkeleton,
  BookingCardSkeleton,
  BookingListSkeleton,
  BookingDetailSkeleton,
  CalendarSkeleton,
  TimeSlotGridSkeleton,
  AdminTableSkeleton,
  DashboardStatsSkeleton,
};
