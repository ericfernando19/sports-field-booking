"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Building2, CheckCircle, Clock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { submitPaymentProof } from "@/actions/payment.actions";
import { formatCurrency } from "@/lib/utils";
import { BANK_INFO } from "@/lib/payment/bank-info";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  bookingId: string;
  amount: number;
  paymentStatus?: string;
  onPaymentSuccess?: () => void;
}

export function PaymentButton({
  bookingId,
  amount,
  paymentStatus = "PENDING",
  onPaymentSuccess,
}: PaymentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "upload">(
    paymentStatus === "WAITING_CONFIRMATION" ? "upload" : "initial"
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Ukuran file maksimal 5MB", variant: "destructive" });
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCopyAccount() {
    await navigator.clipboard.writeText(BANK_INFO.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmitProof() {
    if (!proofFile) {
      toast({ title: "Error", description: "Upload bukti transfer terlebih dahulu", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", proofFile);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast({ title: "Error", description: uploadData.error || "Gagal upload bukti", variant: "destructive" });
        return;
      }

      const result = await submitPaymentProof({
        bookingId,
        proofImage: uploadData.url,
        notes: notes || undefined,
      });

      if (!result.success) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        return;
      }

      toast({ title: "Berhasil", description: result.message });
      onPaymentSuccess?.();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (paymentStatus === "WAITING_CONFIRMATION") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            Menunggu Verifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bukti transfer Anda sedang menunggu verifikasi dari admin. Anda akan mendapat notifikasi setelah pembayaran dikonfirmasi.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Bukti Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Transfer ke rekening:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{BANK_INFO.bankName}</p>
                <p className="font-mono text-lg">{BANK_INFO.accountNumber}</p>
                <p className="text-sm text-muted-foreground">{BANK_INFO.accountName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyAccount}>
                {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Tersalin" : "Salin"}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Jumlah yang harus ditransfer</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(amount)}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Input
              placeholder="Contoh: transfer via mobile banking"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Bukti Transfer</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Bukti transfer"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setProofFile(null);
                    setProofPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Pilih Bukti Transfer
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("initial")}>
              Kembali
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitProof}
              disabled={isLoading || !proofFile}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Kirim Bukti
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Pembayaran Transfer Bank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Transfer ke rekening:</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{BANK_INFO.bankName}</p>
              <p className="font-mono text-lg">{BANK_INFO.accountNumber}</p>
              <p className="text-sm text-muted-foreground">{BANK_INFO.accountName}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyAccount}>
              {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Tersalin" : "Salin"}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">Jumlah yang harus ditransfer</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(amount)}</p>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Setelah transfer, klik tombol di bawah untuk upload bukti transfer.
        </p>

        <Button onClick={() => setStep("upload")} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload Bukti Transfer
        </Button>
      </CardContent>
    </Card>
  );
}
