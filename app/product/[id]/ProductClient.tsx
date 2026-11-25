"use client";

import { Product } from "@/data/product";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Heart, ChevronRight, ChevronLeft, ShoppingCart, Check, Facebook, Link2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import HeartRating from "@/components/product/HeartRating";
import ReviewSection from "@/components/product/ReviewSection";
import { trackEvent } from "@/lib/trackEvent";
import { useLanguage } from "@/context/LanguageContext";
import { swatch } from "@/lib/colors";

type Props = { product: Product; relatedProducts: Product[] };

const FAQ = [
  { q: "faq_our_q1", a: "faq_our_a1" },
  { q: "faq_our_q2", a: "faq_our_a2" },
  { q: "faq_our_q3", a: "faq_our_a3" },
  { q: "faq_our_q4", a: "faq_our_a4" },
];

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47c-.16 0-.43.06-.65.3-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.62.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.47-.28Z"/>
    </svg>
  );
}

export default function ProductClient({ product, relatedProducts }: Props) {
  const { addItem, openCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const tt = t as (k: string, p?: any) => string;

  useEffect(() => {
    if (!authLoading) trackEvent(product.id, "view", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined);
  }, [product.id, authLoading, user]);

  const isFavorited = isFavorite(product.id);
  const variants = product.variants ?? [];
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);

  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  const isOutOfStock = !selectedVariant || (selectedVariant.stock ?? 0) <= 0 || product.status !== "active";
  const images = product.images?.length ? product.images : ["/1.png"];
  const onSale = !!product.originalPrice && product.originalPrice > product.price;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id || `${selectedVariant.color}-${selectedVariant.size}`,
      title: product.title,
      price: product.price,
      image: product.images?.[0] ?? "/1.png",
      color: selectedVariant.color,
      size: selectedVariant.size,
      qty,
      stock: selectedVariant.stock,
    });
    trackEvent(product.id, "cart", user ? { email: user.email || undefined, name: user.displayName || undefined } : undefined);
    openCart();
  };

  const share = (kind: "facebook" | "whatsapp" | "copy") => {
    const url = window.location.href;
    trackEvent(product.id, "share");
    if (kind === "copy") {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (kind === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener");
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${product.title} ${url}`)}`, "_blank", "noopener");
  };

  if (!product) return <div className="p-20 text-center">{t("product_not_found")}</div>;

  const goFav = () => {
    if (!user) { window.location.href = `/login-required?redirect=${encodeURIComponent(window.location.pathname)}`; return; }
    toggleFavorite(product.id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink text-bone">
      <Header />
      <main className="flex-grow">
        <div className="site-container pb-16">
          {/* Breadcrumb + share */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-5 md:py-7">
            <nav className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <Link href="/" className="hover:text-[#00f23a]">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#00f23a]" />
              <Link href="/products" className="hover:text-[#00f23a]">All Clothing</Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#00f23a]" />
              <span className="truncate text-bone/90">{product.title}</span>
            </nav>
            <div className="flex items-center gap-4 rounded-lg border border-bone/10 bg-[#050705] px-4 py-2.5 shadow-[0_0_24px_rgba(0,242,58,.05)]">
              <span className="hidden text-sm font-medium text-[#00f23a] sm:inline">Share item with friends</span>
              <button onClick={() => share("facebook")} aria-label="Share on Facebook" className="text-bone transition hover:text-[#00f23a]"><Facebook size={18} /></button>
              <button onClick={() => share("whatsapp")} aria-label="Share on WhatsApp" className="text-bone transition hover:text-[#00f23a]"><WhatsAppIcon size={18} /></button>
              <button onClick={() => share("copy")} aria-label="Copy link" className="text-bone transition hover:text-[#00f23a]">{copied ? <Check size={18} className="text-[#00f23a]" /> : <Link2 size={18} />}</button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
            {/* Gallery */}
            <div className="flex gap-3 md:gap-4">
              <div className="hidden w-[84px] shrink-0 flex-col gap-2.5 md:flex">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i + 1}`} className={`relative aspect-[6/5] overflow-hidden rounded-md bg-white transition ${activeImg === i ? "ring-2 ring-[#00f23a]" : "opacity-80 hover:opacity-100"}`}>
                    <Image src={img} alt="" fill sizes="84px" className="object-cover" />
                  </button>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">
                  <Image src={images[activeImg] ?? images[0]} alt={product.title} fill priority sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" />
                  {activeImg > 0 && <button onClick={() => setActiveImg((p) => p - 1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-[#00f23a] backdrop-blur"><ChevronLeft size={20} /></button>}
                  {activeImg < images.length - 1 && <button onClick={() => setActiveImg((p) => p + 1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-[#00f23a] backdrop-blur"><ChevronRight size={20} /></button>}
                  {onSale && <span className="absolute left-3 top-3 rounded-full bg-[#00f23a] px-3 py-1 text-xs font-bold uppercase text-ink">Sale</span>}
                </div>
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto md:hidden">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} aria-label={`Image ${i + 1}`} className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-white ${activeImg === i ? "ring-2 ring-[#00f23a]" : "opacity-80"}`}>
                      <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="lg:pt-14">
              <h1 className="text-2xl font-bold uppercase leading-tight tracking-tight md:text-[26px]">{product.title}</h1>
              <p className="mt-2 text-sm text-bone/55">Brand: <span className="text-[#00f23a]">{product.brandName || "Encrypted"}</span></p>
              <div className="mt-4 flex items-center gap-3">
                <HeartRating rating={product.averageRating || 0} size={16} />
                <span className="text-xs text-[#00f23a]">({product.reviewCount || 0}) ratings</span>
              </div>

              <div className="mt-8">
                <p className="text-lg font-medium">Color: <span className="text-[#00f23a]">{selectedColor}</span></p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const ok = variants.some((v) => v.color === color && (v.stock ?? 0) > 0);
                    const on = selectedColor === color;
                    return (
                      <button key={color} title={color} aria-label={color} disabled={!ok} onClick={() => { setSelectedColor(color); setSelectedSize(""); }}
                        className={`grid h-10 w-10 place-items-center rounded-full border transition ${on ? "border-[#00f23a] ring-2 ring-[#00f23a]/50" : "border-bone/25 hover:border-bone/60"} ${!ok ? "cursor-not-allowed opacity-30" : ""}`}
                        style={{ background: swatch(color) }}>
                        {on && <Check size={16} className="text-[#00f23a] drop-shadow-[0_0_3px_#000]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedColor && (
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium">Size:</p>
                    {selectedSize && <span className="text-xs text-bone/50">Fit: {selectedVariant?.fit || "N/A"}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {sizes.map((size) => {
                      const v = variants.find((x) => x.color === selectedColor && x.size === size);
                      const ok = !!v && (v.stock ?? 0) > 0;
                      return (
                        <button key={size} disabled={!ok} onClick={() => setSelectedSize(size)}
                          className={`grid h-10 min-w-10 place-items-center rounded border px-3 text-sm font-medium transition ${selectedSize === size ? "border-transparent bg-gradient-to-r from-[#1d8f2e] to-[#00e63a] text-white" : "border-bone/20 text-bone/70 hover:border-[#00f23a]"} ${!ok ? "cursor-not-allowed opacity-30 line-through" : ""}`}>
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {selectedVariant?.stock !== undefined && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
                    <p className="mt-3 text-xs font-semibold text-[#00f23a]">{tt("product_only_left", { n: selectedVariant.stock })}</p>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3">
                <span className="text-sm">Qty</span>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid h-7 w-7 place-items-center rounded border border-bone/25 hover:border-[#00f23a]"><Minus size={13} /></button>
                <span className="w-5 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(selectedVariant?.stock ?? 99, q + 1))} aria-label="Increase quantity" className="grid h-7 w-7 place-items-center rounded border border-bone/25 hover:border-[#00f23a]"><Plus size={13} /></button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-bone/10 bg-[#050705] p-3 pl-5 shadow-[0_0_24px_rgba(0,242,58,.05)] md:p-4 md:pl-7">
                <div className="min-w-0">
                  <p className="text-2xl font-medium text-[#00f23a] md:text-3xl">EGP {product.price}</p>
                  {onSale && <p className="text-xs text-bone/40 line-through">EGP {product.originalPrice}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={goFav} aria-label="Favorite" className={`grid h-11 w-11 place-items-center rounded-lg border transition ${isFavorited ? "border-[#00f23a] text-[#00f23a]" : "border-bone/20 text-bone/70 hover:border-[#00f23a] hover:text-[#00f23a]"}`}>
                    <Heart size={19} className={isFavorited ? "fill-current" : ""} />
                  </button>
                  <button disabled={isOutOfStock} onClick={handleAdd} className="btn-green !px-4 !py-3 !text-sm disabled:cursor-not-allowed disabled:opacity-40 md:!px-6">
                    <ShoppingCart size={17} />
                    {!selectedVariant ? "Select options" : isOutOfStock ? "Out of stock" : "Add to Basket"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-bone/45">{t("product_shipping_info")}</p>
            </div>
          </div>

          {/* Outfit + FAQ */}
          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {relatedProducts.length > 0 && (
              <div>
                <h2 className="mb-5 text-lg font-bold md:text-xl">For the perfect outfit you should also buy this:</h2>
                <div className="grid grid-cols-2 gap-4">
                  {relatedProducts.slice(0, 2).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
            <div>
              <ul>
                {FAQ.map((f, i) => (
                  <li key={f.q} className="border-b border-[#00f23a]/20 py-4 first:pt-0">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center gap-4 text-left">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#202220] text-sm">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-sm font-medium md:text-base">{tt(f.q)}</span>
                      {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                    </button>
                    {openFaq === i && <p className="mt-3 pl-[60px] text-sm leading-relaxed text-bone/55">{tt(f.a)}</p>}
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center"><Link href="/about?tab=faqs" className="section-title !text-lg underline decoration-[#00f23a]/50 underline-offset-8">See all</Link></div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-14">
            <h2 className="mb-4 text-xl font-bold">Description</h2>
            <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-bone/60">{product.description || t("product_no_description")}</p>
          </div>

          <ReviewSection productId={product.id} averageRating={product.averageRating} reviewCount={product.reviewCount} />

          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-xl font-bold md:text-2xl">You may also like:</h2>
              <ProductGrid products={relatedProducts.slice(0, 8)} dense />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
