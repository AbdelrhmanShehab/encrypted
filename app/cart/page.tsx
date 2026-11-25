"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummaryBox from "@/components/cart/OrderSummaryBox";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items } = useCart();
  return (
    <div className="page-shell">
      <Header />
      <main className="site-container flex-1 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-bone md:text-3xl">Your Cart</h1>
        <p className="mt-1 text-[11px] text-[#00f23a]">{items.length} {items.length === 1 ? "Product" : "Products"}</p>
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-white/70">Your cart is empty.</p>
            <Link href="/products" className="btn-green mt-6">Start shopping</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-14">
            <div className="space-y-4">{items.map(item => <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />)}</div>
            <OrderSummaryBox />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
