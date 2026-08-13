import { useEffect, useState } from "react";

type CartItem = { id: string; price: number; quantity: number };

export function CartSummary({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [items]);

  return <output>{total.toLocaleString("fa-IR")}</output>;
}
