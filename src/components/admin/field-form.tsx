"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldSchema, type FieldInput } from "@/validations/field.schema";
import { createField, updateField } from "@/actions/field.actions";
import { type FieldWithSchedules } from "@/types";

const sportTypes = [
  { value: "FUTSAL", label: "Futsal" },
  { value: "BADMINTON", label: "Bulu Tangkis" },
  { value: "BASKETBALL", label: "Basket" },
  { value: "TENNIS", label: "Tenis" },
  { value: "VOLLEYBALL", label: "Voli" },
  { value: "MINI_SOCCER", label: "Mini Soccer" },
];

interface FieldFormProps {
  field?: FieldWithSchedules;
}

export function FieldForm({ field }: FieldFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(field?.image || null);
  const isEditing = !!field;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldInput>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field
      ? {
          name: field.name,
          slug: field.slug,
          sportType: field.sportType,
          description: field.description || "",
          location: field.location,
          pricePerHour: field.pricePerHour,
          facilities: field.facilities || "",
          image: field.image || "",
          isActive: field.isActive,
        }
      : {
          name: "",
          slug: "",
          sportType: "FUTSAL",
          description: "",
          location: "",
          pricePerHour: 0,
          facilities: "",
          image: "",
          isActive: true,
        },
  });

  const sportType = watch("sportType");

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function onSubmit(data: FieldInput) {
    setIsLoading(true);
    setError(null);

    try {
      const result = isEditing
        ? await updateField(field.id, data)
        : await createField(data);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/admin/fields");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "field");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengupload file");
      }

      const data = await res.json();
      setValue("image", data.url);
    } catch (err: any) {
      setError(err.message || "Gagal mengupload gambar");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemoveImage() {
    setValue("image", "");
    setImagePreview(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lapangan</Label>
            <Input
              id="name"
              placeholder="Contoh: Futsal Arena A"
              {...register("name")}
              onChange={(e) => {
                register("name").onChange(e);
                if (!isEditing) {
                  setValue("slug", generateSlug(e.target.value));
                }
              }}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="futsal-arena-a"
              {...register("slug")}
              disabled={isLoading}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sportType">Jenis Olahraga</Label>
            <Select
              value={sportType}
              onValueChange={(value) => {
                if (value) setValue("sportType", value as FieldInput["sportType"]);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis olahraga" />
              </SelectTrigger>
              <SelectContent>
                {sportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sportType && (
              <p className="text-sm text-destructive">{errors.sportType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang lapangan"
              {...register("description")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lokasi & Harga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              placeholder="Contoh: Jl. Olahraga No. 1"
              {...register("location")}
              disabled={isLoading}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerHour">Harga per Jam (Rp)</Label>
            <Input
              id="pricePerHour"
              type="number"
              placeholder="150000"
              {...register("pricePerHour", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.pricePerHour && (
              <p className="text-sm text-destructive">{errors.pricePerHour.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fasilitas & Gambar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facilities">Fasilitas (pisahkan dengan koma)</Label>
            <Textarea
              id="facilities"
              placeholder="Contoh: Ruang Ganti, Kantin, Parkir Luas"
              {...register("facilities")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Gambar Lapangan</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                  disabled={isLoading || isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Mengupload...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, atau WebP (maks. 5MB)
                    </p>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isLoading || isUploading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Memperbarui..." : "Membuat..."}
            </>
          ) : isEditing ? (
            "Perbarui Lapangan"
          ) : (
            "Buat Lapangan"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
