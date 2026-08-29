import { notFound } from "next/navigation";
import { FieldForm } from "@/components/admin/field-form";
import { getFieldById } from "@/actions/field.actions";

interface EditFieldPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFieldPage({ params }: EditFieldPageProps) {
  const { id } = await params;
  const field = await getFieldById(id);

  if (!field) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Lapangan</h1>
        <p className="text-muted-foreground">
          Perbarui informasi lapangan {field.name}
        </p>
      </div>
      <FieldForm field={field} />
    </div>
  );
}
