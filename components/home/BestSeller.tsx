"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/product";
import QuickAddModal from "../product/QuickAddModal";

export default function BestSeller({ products }: { products: Product[] }) {
  const product = products?.[0];
  const [selected, setSelected] = useState<Product | null>(null);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const images = useMemo(() => (product?.images ?? []).filter(Boolean), [product]);
  const sizes = useMemo(() => {
    const map = new Map<string, boolean>();
    (product?.variants ?? []).forEach(v => map.set(v.size, (map.get(v.size) ?? false) || v.stock > 0));
    return [...map.entries()].slice(0, 6);
  }, [product]);
  if (!product || images.length === 0) return null;

  const n = images.length;
  const at = (offset: number) => images[(active + offset) % n];
  const move = (dir: number) => setActive(v => (v + dir + n) % n);
  const tile = "relative overflow-hidden bg-[#0c110d]";
  const arrow = "grid h-8 w-8 place-items-center rounded-[3px] bg-gradient-to-b from-[#0aa82c] to-[#00f23a] text-ink transition hover:brightness-110";

  return (
    <section className="site-container py-12 md:py-16" aria-label="Bestseller">
      <h2 className="section-title mb-6">Bestseller</h2>
      <div className="grid gap-8 md:grid-cols-[1.35fr_1fr] md:gap-12">
        <div>
          {/* Mobile: swipeable gallery */}
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:hidden">
            {images.map((src, i) => (
              <div key={src + i} className={`${tile} aspect-[4/5] w-[82%] shrink-0 snap-center`}>
                <Image src={src} alt={`${product.title} ${i + 1}`} fill sizes="82vw" className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
          {/* Desktop: collage */}
          <div className="hidden md:block">
            {n >= 3 ? (
              <div className="grid grid-cols-[1fr_1.08fr] grid-rows-2 gap-2">
                <div className={`${tile} aspect-[1.05]`}><Image src={at(0)} alt={product.title} fill sizes="25vw" className="object-cover" priority /></div>
                <div className={`${tile} row-span-2`}><Image src={at(2)} alt={product.title} fill sizes="28vw" className="object-cover" /></div>
                <div className={`${tile} aspect-[1.05]`}><Image src={at(1)} alt={product.title} fill sizes="25vw" className="object-cover" /></div>
              </div>
            ) : (
              <div className={`grid gap-2 ${n === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {images.map((src, i) => <div key={src + i} className={`${tile} aspect-[4/5]`}><Image src={src} alt={product.title} fill sizes="40vw" className="object-cover" /></div>)}
              </div>
            )}
            {n > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button onClick={() => move(-1)} className={arrow} aria-label="Previous photo"><ChevronLeft size={18} /></button>
                <div className="flex gap-1.5">{images.map((_, i) => <button key={i} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-[#00f23a]" : "bg-bone/40"}`} />)}</div>
                <button onClick={() => move(1)} className={arrow} aria-label="Next photo"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-2xl font-medium leading-tight md:text-3xl">{product.title}</h3>
          <p className="mt-6 text-lg font-semibold text-[#00f23a] md:mt-10">{product.price.toLocaleString()} EGP</p>
          {sizes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Size">
              {sizes.map(([s, inStock]) => (
                <button key={s} disabled={!inStock} onClick={() => setSize(s === size ? "" : s)} aria-pressed={size === s}
                  className={`grid h-9 min-w-10 place-items-center rounded-[4px] border px-2 text-[11px] transition ${size === s ? "border-[#00f23a] bg-gradient-to-b from-[#0aa82c] to-[#00f23a] font-bold text-bone" : "border-bone/20 bg-[#161616] text-bone/60 hover:border-[#00f23a]"} ${!inStock ? "cursor-not-allowed line-through opacity-35" : ""}`}>{s}</button>
              ))}
            </div>
          )}
          <p className="mt-8 max-w-md text-xs leading-6 text-bone/80 md:mt-10">{product.description?.slice(0, 220) || "Designed by Encrypted to catch attention while still blending in. Comfortable, lightweight and built for any occasion."}</p>
          <button onClick={() => setSelected(product)} className="mt-8 inline-flex w-fit items-center gap-2 rounded-[4px] bg-gradient-to-b from-[#0aa82c] to-[#00f23a] px-6 py-3 text-xs font-semibold text-bone transition hover:brightness-110 md:mt-12"><ShoppingBag size={14} /> Add to Basket</button>
        </div>
      </div>
      {selected && <QuickAddModal product={selected} initialSize={size} onClose={() => setSelected(null)} />}
    </section>
  );
}
