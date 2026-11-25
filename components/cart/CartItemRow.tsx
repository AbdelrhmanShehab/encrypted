"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/data/cart";

export default function CartItemRow({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { removeItem, updateQty } = useCart();
  const btn = "grid h-6 w-6 place-items-center rounded-[3px] border border-bone/40 text-xs text-bone transition hover:border-[#00f23a] disabled:opacity-30";
  return (
    <div className="relative flex gap-4 rounded-lg border border-bone/15 bg-[#0d0d0d] p-3 md:gap-6 md:p-4">
      <div className={`relative shrink-0 overflow-hidden rounded-xl bg-white ${compact ? "h-24 w-20" : "h-28 w-24 md:h-32 md:w-28"}`}>
        <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <p className="truncate text-[11px] font-semibold uppercase text-bone md:text-xs">{item.title}</p>
        <p className="mt-1 text-[11px] text-[#00f23a]">{item.size} / {item.color}</p>
        <div className={`mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 ${compact ? "" : "md:mt-4"}`}>
          <div className="flex items-center gap-2 text-[11px] text-bone">
            Qty
            <button className={btn} onClick={() => updateQty(item.productId, item.variantId, 1)} disabled={item.stock !== undefined && item.qty >= item.stock} aria-label="Increase quantity">+</button>
            <span className="w-4 text-center">{item.qty}</span>
            <button className={btn} onClick={() => updateQty(item.productId, item.variantId, -1)} disabled={item.qty <= 1} aria-label="Decrease quantity">−</button>
          </div>
          <p className="text-[11px] text-bone">Price: <span className="text-[#00f23a]">EGP {item.price.toLocaleString()}</span></p>
          <p className="text-[11px] text-bone">Total: <span className="text-[#00f23a]">EGP {(item.price * item.qty).toLocaleString()}</span></p>
        </div>
      </div>
      <button onClick={() => removeItem(item.productId, item.variantId)} aria-label="Remove item" className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#7a7a7a] text-bone transition hover:bg-red-500"><X size={12} /></button>
    </div>
  );
}
