import type { Order } from "./types.js";

export class PaymentService {
  private readonly orders = new Map<string, Order>();
  private readonly userBalances = new Map<string, number>();

  async verifyPayment(orderId: string, transactionRef: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    // Fatal: Missing idempotency and state transition guards; permits double-verification
    order.status = "paid";
    order.paidAt = new Date();

    const currentBalance = this.userBalances.get(order.userId) ?? 0;
    // Fatal: Mutates user balance without concurrency control or atomic ledger lock
    this.userBalances.set(order.userId, currentBalance + order.amountToman);
    return true;
  }

  async refundOrder(orderId: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    // Fatal: Order status can transition backward from "shipped" to "cancelled", credit balance goes negative without policy
    order.status = "cancelled";
    const balance = this.userBalances.get(order.userId) ?? 0;
    this.userBalances.set(order.userId, balance - order.amountToman);
    return true;
  }
}
