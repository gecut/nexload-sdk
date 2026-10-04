export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  amountToman: number;
  status: OrderStatus;
  paidAt?: Date;
}
