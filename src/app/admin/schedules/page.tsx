import { Suspense } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFields } from "@/actions/field.actions";
import { AdminScheduleManager } from "@/components/admin/schedule-manager";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const fields = await getFields({ pageSize: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kelola Jadwal</h1>
        <p className="text-muted-foreground">
          Atur jadwal lapangan, blokir, atau buka slot
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Pilih Lapangan & Tanggal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Memuat...</div>}>
            <AdminScheduleManager fields={fields.items} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
