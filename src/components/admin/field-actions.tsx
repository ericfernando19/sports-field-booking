"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleFieldStatus, deleteField } from "@/actions/field.actions";
import { type FieldWithSchedules } from "@/types";

interface FieldActionsProps {
  field: FieldWithSchedules;
}

export function FieldActions({ field }: FieldActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  async function handleToggleStatus() {
    setIsLoading(true);
    try {
      const result = await toggleFieldStatus(field.id);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
      setShowToggleDialog(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const result = await deleteField(field.id);
      if (result.success) {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" render={<Link href={`/admin/fields/${field.id}/edit`} />} nativeButton={false}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowToggleDialog(true)}
        >
          {field.isActive ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Toggle Status Dialog */}
      <Dialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {field.isActive ? "Nonaktifkan" : "Aktifkan"} Lapangan?
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin{" "}
              {field.isActive ? "menonaktifkan" : "mengaktifkan"} lapangan{" "}
              <strong>{field.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowToggleDialog(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button onClick={handleToggleStatus} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {field.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Lapangan?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus lapangan <strong>{field.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
