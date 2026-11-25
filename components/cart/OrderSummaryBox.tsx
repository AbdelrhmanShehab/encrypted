"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function OrderSummaryBox({ onNavigate }: { onNavigate?: () => void }) {
  const { subtotal, items } = useCart();
  return (
    <div>
      <h2 className="rounded-lg bg-[#202020] py-4 text-center text-lg font-bold text-[#00f23a]">Order Summary</h2>
      <div className="mt-3 rounded-lg bg-[#202020] p-5 text-xs text-bone">
        <div className="flex justify-between py-1.5"><span>Total:</span><span className="text-[#00f23a]">EGP {subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between py-1.5"><span>Shipping</span><span className="text-[#00f23a]">to be calculated</span></div>
        <div className="my-4 h-px bg-bone/25" />
        <Link href="/checkout" onClick={onNavigate} aria-disabled={items.length === 0} className={`btn-green w-full py-3 ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}>Go to checkout</Link>
        <Link href="/products" onClick={onNavigate} className="btn-outline mt-3 w-full py-3">Continue shopping</Link>
      </div>
    </div>
  );
}
