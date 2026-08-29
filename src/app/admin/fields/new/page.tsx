import { FieldForm } from "@/components/admin/field-form";

export default function NewFieldPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Lapangan Baru</h1>
        <p className="text-muted-foreground">
          Isi informasi lapangan yang akan ditambahkan
        </p>
      </div>
      <FieldForm />
    </div>
  );
}
