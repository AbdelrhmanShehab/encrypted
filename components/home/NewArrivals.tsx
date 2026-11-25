"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/product";
import QuickAddModal from "../product/QuickAddModal";
import { useLanguage } from "@/context/LanguageContext";

export default function NewArrivals({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Product | null>(null);
  const list = Array.isArray(products) ? products.filter(p => p && typeof p === "object" && p.id) : [];
  if (list.length === 0) return null;
  const [big, ...rest] = list;
  const small = rest.slice(0, 4);

  const card = (product: Product, isBig = false) => {
    const stock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
    const sold = stock === 0 || product.status !== "active";
    const price = typeof product.price === "number" ? product.price : 0;
    const title = typeof product.title === "string" ? product.title : "Untitled";
    const discount = product.originalPrice && product.originalPrice > price ? Math.round(((product.originalPrice - price) / product.originalPrice) * 100) : 0;
    return (
      <div key={product.id} className={`group relative overflow-hidden bg-[#0c110d] ${isBig ? "col-span-2 aspect-[4/5] md:col-span-1 md:row-span-2 md:aspect-auto" : "aspect-square md:aspect-auto"}`}>
        <Link href={`/product/${product.id}`} className="absolute inset-0" aria-label={title}>
          <Image src={product.images?.[0] ?? "/1.png"} alt={title} fill sizes={isBig ? "(max-width: 768px) 100vw, 36vw" : "(max-width: 768px) 50vw, 22vw"} className={`object-cover transition duration-700 group-hover:scale-105 ${sold ? "opacity-60 grayscale" : ""}`} />
        </Link>
        {/* Mobile caption (no hover on touch) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-8 md:hidden">
          <p className="truncate text-xs text-bone/90">{title}</p>
          <p className="text-sm font-semibold text-[#00f23a]">{price.toLocaleString()} EGP</p>
        </div>
        {/* Desktop hover overlay */}
        {!sold && (
          <div className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center gap-3 bg-ink/45 opacity-0 transition duration-300 group-hover:opacity-100 md:flex">
            <span className="text-2xl font-medium">{price.toLocaleString()} EGP</span>
            <button onClick={() => setSelected(product)} className="pointer-events-auto inline-flex items-center gap-2 border border-bone px-4 py-1.5 text-[11px] transition hover:bg-bone hover:text-ink"><ShoppingBag size={12} /> Add To Basket</button>
          </div>
        )}
        {!sold && (
          <button onClick={() => setSelected(product)} aria-label={`Add ${title} to basket`} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#00f23a] text-ink md:hidden"><ShoppingBag size={14} /></button>
        )}
        {sold && <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/55 text-sm text-bone/90">Sold</span>}
        {discount > 0 && !sold && <span className="absolute left-2 top-2 border border-[#00f23a]/60 bg-ink/80 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00f23a]">-{discount}%</span>}
      </div>
    );
  };

  return (
    <section id="new-drops" className="site-container py-12 md:py-16">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-10">
        <h2 className="section-title">{t("new_arrivals_title")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-[1.55fr_1fr_1fr] md:grid-rows-2 md:gap-[5px] md:h-[620px]">
        {card(big, true)}
        {small.map(p => card(p))}
      </div>
      {selected && <QuickAddModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
