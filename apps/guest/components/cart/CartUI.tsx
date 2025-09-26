"use client";

import React, { useState } from "react";
import { useCart } from "./CartProvider";

export function CartToggle() {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-emerald-600 text-white px-4 py-2 shadow-lg"
    >
      Cart
      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </button>
  );
}

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

export function CartDrawer({ onClose }: { onClose(): void }) {
  const { items, remove, subtotal, clear } = useCart();
  return (
    <div className="fixed bottom-16 right-4 w-80 bg-white text-zinc-900 rounded-lg border border-zinc-200 shadow-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">Your Cart</div>
        <button className="text-sm text-zinc-500 hover:text-zinc-700" onClick={onClose}>Close</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto">
        {items.length === 0 && <div className="text-sm text-zinc-500">Cart is empty</div>}
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-zinc-500">{it.qty} × {cents(it.price)}</div>
            </div>
            <button className="text-rose-600" onClick={() => remove(it.id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-zinc-600">Subtotal</div>
        <div className="font-semibold">{cents(subtotal)}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 border border-zinc-300 rounded-md py-2 text-sm" onClick={clear}>Clear</button>
        <a href="/extend" className="flex-1 text-center rounded-md py-2 text-sm bg-emerald-600 text-white">Checkout</a>
      </div>
    </div>
  );
}


