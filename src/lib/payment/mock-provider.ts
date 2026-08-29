import {
  PaymentProvider,
  CreatePaymentInput,
  PaymentResult,
  PaymentStatus,
} from "./types";

export class MockPaymentProvider implements PaymentProvider {
  private transactions: Map<
    string,
    {
      amount: number;
      method: string;
      status: PaymentStatus["status"];
      paidAt?: Date;
    }
  > = new Map();

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    this.transactions.set(transactionId, {
      amount: input.amount,
      method: input.method,
      status: "PENDING",
    });

    return {
      success: true,
      transactionId,
      message: "Payment created successfully",
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return {
      transactionId,
      status: transaction.status,
      paidAt: transaction.paidAt,
    };
  }

  async cancelPayment(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "PENDING") {
      throw new Error("Cannot cancel non-pending transaction");
    }

    transaction.status = "FAILED";
  }

  async refundPayment(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "PAID") {
      throw new Error("Cannot refund non-paid transaction");
    }

    transaction.status = "REFUNDED";
  }

  async simulatePayment(transactionId: string): Promise<PaymentStatus> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "PENDING") {
      throw new Error("Cannot simulate non-pending transaction");
    }

    transaction.status = "PAID";
    transaction.paidAt = new Date();

    return {
      transactionId,
      status: "PAID",
      paidAt: transaction.paidAt,
    };
  }
}

export const paymentProvider = new MockPaymentProvider();
