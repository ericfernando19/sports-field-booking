"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPayment, simulatePaymentSuccess } from "@/actions/payment.actions";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  bookingId: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

export function PaymentButton({
  bookingId,
  amount,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);

  async function handleCreatePayment() {
    setIsLoading(true);
    try {
      const result = await createPayment({
        bookingId,
        method: "MOCK",
      });

      if (!result.success) {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      setPaymentCreated(true);
      toast({
        title: "Pembayaran Dibuat",
        description: "Menunggu konfirmasi pembayaran...",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSimulatePayment() {
    setIsLoading(true);
    try {
      const result = await simulatePaymentSuccess(bookingId);

      if (!result.success) {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Pembayaran Berhasil!",
        description: "Booking Anda telah dikonfirmasi.",
      });
      onPaymentSuccess?.();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  if (paymentCreated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Menunggu Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(amount)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Klik tombol di bawah untuk mensimulasikan pembayaran berhasil.
          </p>
          <Button
            onClick={handleSimulatePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Simulasikan Pembayaran Berhasil
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button onClick={handleCreatePayment} disabled={isLoading} className="w-full">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Bayar Sekarang
    </Button>
  );
}
