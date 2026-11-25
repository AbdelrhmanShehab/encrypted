"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFavorites } from "@/context/FavoritesContext";
import type { Product } from "@/data/product";

export default function FavoritesClient() {
  const { favorites, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (favorites.length === 0) { setProducts([]); setLoading(false); return; }
      try {
        const res = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productIds: favorites }) });
        if (res.ok) setProducts(await res.json());
      } catch (err) { console.error("Error fetching favorites:", err); }
      finally { setLoading(false); }
    };
    load();
  }, [favorites]);

  return (
    <div className="page-shell">
      <Header />
      <main className="site-container flex-1 py-10 md:py-14">
        <h1 className="page-title mb-8 md:mb-10">Loved By you</h1>
        {loading ? (
          <p className="py-20 text-center text-white/40">Loading…</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-8">
            {products.map(p => (
              <div key={p.id} className="relative">
                <Link href={`/product/${p.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white">
                    <Image src={p.images?.[0] ?? "/1.png"} alt={p.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <p className="mt-3 truncate text-[11px] text-bone">{p.title}</p>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="bg-[#00f23a] px-2 py-1 font-mono text-xs font-semibold text-black">EGP {p.price.toLocaleString()}</span>
                  <button onClick={() => toggleFavorite(p.id)} aria-label="Remove from favorites"><Heart size={18} className="text-[#00f23a]" /></button>
                </div>
                <button onClick={() => toggleFavorite(p.id)} aria-label="Remove" className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#9a9a9a]/80 text-white"><X size={12} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Heart className="mx-auto mb-4 text-[#00f23a]" size={36} />
            <p className="text-sm text-white/70">Nothing saved yet. Tap the heart on any piece to keep it here.</p>
            <Link href="/products" className="btn-green mt-6">Start shopping</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
