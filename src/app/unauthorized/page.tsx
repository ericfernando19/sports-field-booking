import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="text-center">
        <ShieldX className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Akses Ditolak</h1>
        <p className="mt-2 text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/fields"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Lihat Lapangan
          </Link>
        </div>
      </div>
    </div>
  );
}
