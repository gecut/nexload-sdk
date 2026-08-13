"use client";

import { useState } from "react";

export default async function CheckoutPage() {
  const cart = await fetch("https://example.test/cart").then((response) => response.json());
  const [quantity, setQuantity] = useState(1);

  async function submitOrder() {
    "use server";
    await saveOrder({ cart, quantity });
  }

  return <main>
    <h1>تسویه حساب</h1>
    <button onClick={() => setQuantity((value) => value + 1)}>+</button>
    <span>{quantity}</span>
    <form action={submitOrder}><button type="submit">ثبت سفارش</button></form>
  </main>;
}

declare function saveOrder(input: unknown): Promise<void>;
