"use client";

import { X, ShoppingBag, ShieldCheck, Lock, KeyRound } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import CartItemRow from "./cart/CartItemRow";
import OrderSummaryBox from "./cart/OrderSummaryBox";

export function CartSidebar() {
  const { isOpen, closeCart, items } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] cursor-pointer bg-ink/80 backdrop-blur-[2px]" onClick={closeCart} />
      <aside className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[#00f23a]/30 bg-ink shadow-2xl" role="dialog" aria-label="Your cart">
        <div className="flex items-center justify-between border-b border-bone/10 p-5">
          <div>
            <h2 className="text-xl font-bold text-bone">Your Cart</h2>
            <p className="mt-0.5 font-[family-name:var(--font-terminal)] text-[13px] tracking-[.14em] text-[#00f23a]/70">&gt; SECURE_SESSION // ENCRYPTED</p>
            <p className="text-[11px] text-[#00f23a]">{items.length} {items.length === 1 ? "Product" : "Products"}</p>
          </div>
          <button onClick={closeCart} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full text-bone/70 transition hover:bg-bone/10 hover:text-bone"><X size={18} /></button>
        </div>
        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full border border-[#00f23a]/40 bg-[#00f23a]/5 shadow-[0_0_24px_rgba(0,242,58,.2)]"><ShoppingBag size={34} className="text-[#00f23a]" /></div>
              <p className="font-[family-name:var(--font-terminal)] text-xl tracking-[.12em] text-[#00f23a]">&gt; CART_EMPTY<span className="hero-cursor">_</span></p>
              <p className="text-sm text-bone/70">No items decrypted yet.</p>
              <button onClick={closeCart} className="btn-green">Start shopping</button>
            </div>
          ) : items.map(item => <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} compact />)}
        </div>
        {items.length > 0 && (
          <div className="space-y-3 border-t border-bone/10 p-5">
            <p className="flex items-center justify-center gap-2 text-center font-[family-name:var(--font-terminal)] text-[14px] tracking-[.1em] text-bone/70"><Lock size={12} className="text-[#00f23a]" />ZERO TRUST, BUT YOU CAN TRUST US</p>
            <OrderSummaryBox onNavigate={closeCart} />
            <Link href="/cart" onClick={closeCart} className="block text-center text-[11px] text-[#00f23a] underline underline-offset-4">View full cart</Link>
          </div>
        )}
        <div className="flex items-center justify-center gap-5 border-t border-bone/10 px-5 py-3 text-[10px] uppercase tracking-wider text-bone/55">
          <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#00f23a]" />Secure checkout</span>
          <span className="flex items-center gap-1.5"><KeyRound size={12} className="text-[#00f23a]" />No card data</span>
        </div>
      </aside>
    </>
  );
}
