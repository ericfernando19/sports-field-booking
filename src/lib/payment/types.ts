export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  method: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  paidAt?: Date;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  cancelPayment(transactionId: string): Promise<void>;
  refundPayment(transactionId: string): Promise<void>;
}
