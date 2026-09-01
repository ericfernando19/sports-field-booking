"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Eye, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getPendingPayments, verifyPayment } from "@/actions/payment.actions";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PaymentItem {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  proofImage: string | null;
  bankName: string | null;
  accountName: string | null;
  notes: string | null;
  createdAt: Date;
  booking: {
    bookingCode: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    user: { name: string; email: string };
    field: { name: string };
  };
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyAction, setVerifyAction] = useState<"approve" | "reject">("approve");
  const [isVerifying, setIsVerifying] = useState(false);

  async function loadPayments() {
    setIsLoading(true);
    try {
      const result = await getPendingPayments();
      if (result.success && result.data) {
        setPayments(result.data as PaymentItem[]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  function handleViewProof(payment: PaymentItem) {
    setSelectedPayment(payment);
    setShowProofDialog(true);
  }

  function handleVerify(payment: PaymentItem, action: "approve" | "reject") {
    setSelectedPayment(payment);
    setVerifyAction(action);
    setShowVerifyDialog(true);
  }

  async function confirmVerify() {
    if (!selectedPayment) return;
    setIsVerifying(true);
    try {
      const result = await verifyPayment(selectedPayment.bookingId, verifyAction);
      if (result.success) {
        toast({ title: "Berhasil", description: result.message });
        setShowVerifyDialog(false);
        setSelectedPayment(null);
        await loadPayments();
      } else {
        toast({ title: "Gagal", description: result.message, variant: "destructive" });
      }
    } finally {
      setIsVerifying(false);
    }
  }

  const waitingPayments = payments.filter((p) => p.status === "WAITING_CONFIRMATION");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifikasi Pembayaran</h1>
        <p className="text-muted-foreground">Konfirmasi atau tolak pembayaran dari user</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{waitingPayments.length}</p>
            <p className="text-sm text-muted-foreground">Bukti transfer perlu diverifikasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Belum Bayar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingPayments.length}</p>
            <p className="text-sm text-muted-foreground">Menunggu user upload bukti</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">Semua pembayaran sudah terverifikasi.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Kode Booking</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Lapangan</th>
                  <th className="text-left p-3 font-medium">Tanggal Main</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Jumlah</th>
                  <th className="text-right p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="p-3 font-mono font-bold">
                      {payment.booking.bookingCode}
                    </td>
                    <td className="p-3">
                      <div>{payment.booking.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.booking.user.email}
                      </div>
                    </td>
                    <td className="p-3">{payment.booking.field.name}</td>
                    <td className="p-3">
                      {new Date(payment.booking.bookingDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {payment.booking.startTime}-{payment.booking.endTime}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={
                          payment.status === "WAITING_CONFIRMATION"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payment.status === "WAITING_CONFIRMATION"
                          ? "Menunggu Verifikasi"
                          : "Belum Bayar"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.proofImage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewProof(payment)}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === "WAITING_CONFIRMATION" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleVerify(payment, "approve")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleVerify(payment, "reject")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Image Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bukti Transfer</DialogTitle>
            <DialogDescription>
              {selectedPayment?.booking.bookingCode} - {selectedPayment?.booking.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPayment?.proofImage && (
              <img
                src={selectedPayment.proofImage}
                alt="Bukti transfer"
                className="w-full rounded-lg border"
              />
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-bold">{selectedPayment && formatCurrency(selectedPayment.amount)}</span>
              </div>
              {selectedPayment?.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Catatan: </span>
                    <span>{selectedPayment.notes}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProofDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === "approve" ? "Verifikasi Pembayaran?" : "Tolak Pembayaran?"}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === "approve"
                ? `Pastikan bukti transfer valid. Pembayaran sebesar ${selectedPayment && formatCurrency(selectedPayment.amount)} untuk booking ${selectedPayment?.booking.bookingCode} akan ditandai sebagai lunas.`
                : `Pembayaran untuk booking ${selectedPayment?.booking.bookingCode} akan ditolak. User perlu mengupload ulang bukti transfer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)} disabled={isVerifying}>
              Batal
            </Button>
            <Button
              variant={verifyAction === "approve" ? "default" : "destructive"}
              onClick={confirmVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : verifyAction === "approve" ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {verifyAction === "approve" ? "Verifikasi" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
