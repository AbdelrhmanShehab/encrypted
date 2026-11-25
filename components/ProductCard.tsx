"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../data/product";
import QuickAddModal from "./product/QuickAddModal";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { swatch } from "@/lib/colors";

type Props = { product: Product; onRemove?: () => void };

function Card({ product }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const fav = isFavorite(product.id);

  const variants = useMemo(() => (Array.isArray(product.variants) ? product.variants : []), [product.variants]);
  const hasStock = product.status === "active" && variants.reduce((s, v) => s + (v?.stock || 0), 0) > 0;
  const colors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))].slice(0, 6), [variants]);
  const [img, setImg] = useState(product.images?.[0] ?? "/1.png");
  useEffect(() => setImg(product.images?.[0] ?? "/1.png"), [product.images]);

  const title = typeof product.title === "string" ? product.title : "Untitled Product";
  const price = typeof product.price === "number" ? product.price : 0;
  const old = typeof product.originalPrice === "number" && product.originalPrice > price ? product.originalPrice : null;

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push(`/login-required?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    toggleFavorite(product.id);
  };

  return (
    <>
      <div className="group/card relative">
        <Link href={`/product/${product.id}`} onClick={() => trackEvent(product.id, "click", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined)} className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white">
            <Image src={img} alt={title} fill sizes="(max-width:768px) 50vw, 320px" className="object-cover transition duration-500 group-hover/card:scale-105" />
            {!hasStock && <div className="absolute inset-0 grid place-items-center bg-black/60 text-xs text-bone md:text-sm">Sold out</div>}
          </div>
          <p className="mt-3 truncate text-[11px] text-bone md:text-xs">{title}</p>
          <p className="mt-1.5 font-mono text-xs font-semibold tracking-wide text-[#00f23a] md:text-sm">
            EGP {price.toLocaleString()}
            {old && <span className="ml-2 text-[10px] font-normal text-white/40 line-through">EGP {old.toLocaleString()}</span>}
          </p>
          {colors.length > 0 && (
            <div className="mt-2 flex gap-1.5" aria-label="Colors">
              {colors.map(c => <span key={c} title={c} className="h-3 w-3 rounded-full border border-white/40" style={{ background: swatch(c) }} />)}
            </div>
          )}
        </Link>
        <button onClick={onFav} aria-label={fav ? "Remove from favorites" : "Add to favorites"} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#9a9a9a]/70 backdrop-blur transition hover:bg-[#9a9a9a]">
          <Heart size={16} className={fav ? "fill-[#00f23a] text-[#00f23a]" : "text-white"} />
        </button>
        {hasStock && (
          <button onClick={() => setOpen(true)} aria-label={`Quick add ${title}`} className="absolute bottom-[4.2rem] right-2 hidden h-9 w-9 place-items-center rounded-full bg-[#00f23a] text-black opacity-0 shadow-lg transition group-hover/card:opacity-100 md:grid">
            <ShoppingBag size={16} />
          </button>
        )}
      </div>
      {open && <QuickAddModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

const ProductCard = React.memo(function ProductCard(props: Props) {
  if (!props.product || typeof props.product !== "object" || !props.product.id) return null;
  return <Card {...props} />;
});

export default ProductCard;
