"use client";

import { Suspense, useEffect, useMemo, useState, memo, useCallback } from "react";
import { Product } from "../../data/product";
import ProductGrid from "../../components/ProductGrid";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Search, ChevronLeft, ChevronRight, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { swatch } from "@/lib/colors";
import { useLanguage } from "@/context/LanguageContext";
import { isMenswearCategory, isMenswearProduct } from "@/lib/menswear";

/* ---------------- TYPES ---------------- */

type SortType = "" | "new" | "best" | "price-high" | "price-low";

type Category = {
  id: string;
  name: string;
  slug: string;
};

/* ---------------- MODULE-LEVEL CACHE (fetch once per session, NO Firebase SDK) ---------------- */

let _cachedProducts: Product[] | null = null;
let _cachedCategories: Category[] | null = null;
let _fetchPromise: Promise<{ products: Product[]; categories: Category[] }> | null = null;

async function fetchProductsOnce() {
  if (_cachedProducts && _cachedCategories) {
    return { products: _cachedProducts, categories: _cachedCategories };
  }
  if (_fetchPromise) return _fetchPromise;

  // ✅ Calls our own Next.js API route — uses Firestore REST API internally.
  // No Firebase SDK on the client = no channel/WebSocket connections.
  _fetchPromise = fetch("/api/products")
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    })
    .then(data => {
      const allCategories: Category[] = Array.isArray(data.categories) ? data.categories : [];
      _cachedProducts = (Array.isArray(data.products) ? data.products : []).filter((p: Product) => isMenswearProduct(p, allCategories));
      _cachedCategories = allCategories.filter(isMenswearCategory);
      return { products: _cachedProducts!, categories: _cachedCategories! };
    })
    .catch(err => {
      _fetchPromise = null; // allow retry on next mount
      console.error("Products fetch error:", err);
      return { products: [], categories: [] };
    });

  return _fetchPromise;
}

/* ---------------- CONSTANTS ---------------- */

const PAGE_SIZE = 12;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/* ---------------- PAGINATOR ---------------- */

const Paginator = memo(function Paginator({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const arrow = "grid h-8 w-8 place-items-center rounded-[3px] bg-gradient-to-b from-[#0aa82c] to-[#00f23a] text-black disabled:opacity-30";
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className={arrow} aria-label="Previous page"><ChevronLeft size={18} /></button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)} aria-label={`Page ${p}`} aria-current={p === page} className={`h-2 w-2 rounded-full border border-[#00f23a] ${p === page ? "bg-[#00f23a]" : ""}`} />
        ))}
      </div>
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className={arrow} aria-label="Next page"><ChevronRight size={18} /></button>
    </div>
  );
});

/* ---------------- SIDEBAR PIECES ---------------- */

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className="pb-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-2 text-xs font-semibold text-bone" aria-expanded={open}>
        {title}{open ? <Minus size={14} /> : <Plus size={14} />}
      </button>
      {open && <div className="space-y-2.5 pt-2">{children}</div>}
      <div className="green-line mt-3" />
    </div>
  );
}

function Check({ checked, label, onChange }: { checked: boolean; label: React.ReactNode; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-white/60 hover:text-bone">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`grid h-3.5 w-3.5 place-items-center rounded-[3px] border ${checked ? "border-[#00f23a] bg-[#00f23a]" : "border-white/40"}`}>
        {checked && <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-black"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
      </span>
      {label}
    </label>
  );
}

/* ---------------- MAIN CONTENT ---------------- */

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const urlCategory = searchParams.get("category") || null;
  const urlSort = (searchParams.get("sort") || "") as SortType;
  const urlSearch = searchParams.get("search") || "";
  const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [products, setProducts] = useState<Product[]>(_cachedProducts ?? []);
  const [categories, setCategories] = useState<Category[]>(_cachedCategories ?? []);
  const [loading, setLoading] = useState(!_cachedProducts);

  const [sort, setSort] = useState<SortType>(urlSort);
  const [filterCategory, setFilterCategory] = useState<string | null>(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [page, setPage] = useState(urlPage);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // Sidebar edits are staged until "Apply filter" is pressed.
  const [draftCategory, setDraftCategory] = useState<string | null>(urlCategory);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [draftColors, setDraftColors] = useState<string[]>([]);
  const [open, setOpen] = useState({ sort: true, category: true, size: false, color: false });
  const [dense, setDense] = useState(false);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    if (_cachedProducts) { setLoading(false); return; }
    fetchProductsOnce().then(({ products, categories }) => { setProducts(products); setCategories(categories); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const saved = sessionStorage.getItem("products-scroll-position");
      if (saved) { setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: "instant" }), 80); sessionStorage.removeItem("products-scroll-position"); }
    }
  }, [loading, products]);

  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 0) sessionStorage.setItem("products-scroll-position", window.scrollY.toString()); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (urlCategory !== filterCategory) { setFilterCategory(urlCategory); setDraftCategory(urlCategory); }
    if (urlSort !== sort) setSort(urlSort);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlPage !== page) setPage(urlPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlSort, urlSearch, urlPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (sort) params.set("sort", sort);
      if (searchQuery) params.set("search", searchQuery);
      if (page > 1) params.set("page", String(page));
      const nextUrl = params.toString() ? `/products?${params}` : "/products";
      if (nextUrl !== window.location.pathname + window.location.search) router.push(nextUrl, { scroll: false });
    }, 400);
    return () => clearTimeout(handler);
  }, [filterCategory, sort, searchQuery, page, router]);

  const resetPage = useCallback(() => setPage(1), []);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.variants?.forEach(v => v.size && set.add(v.size)));
    return [...set].sort((a, b) => (SIZE_ORDER.indexOf(a) + 1 || 99) - (SIZE_ORDER.indexOf(b) + 1 || 99));
  }, [products]);
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.variants?.forEach(v => v.color && set.add(v.color)));
    return [...set].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (filterCategory) result = result.filter(p => p.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sizes.length) result = result.filter(p => p.variants?.some(v => sizes.includes(v.size) && v.stock > 0));
    if (colors.length) result = result.filter(p => p.variants?.some(v => colors.includes(v.color)));
    switch (sort) {
      case "new": result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)); break;
      case "best": result = result.filter(p => p.isBestSeller); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
    }
    return result;
  }, [products, filterCategory, sort, searchQuery, sizes, colors]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = useMemo(() => filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredProducts, safePage]);

  const sortOptions: { value: SortType; label: string }[] = [
    { value: "price-high", label: "Price from high to low" },
    { value: "price-low", label: "Price from low to high" },
    { value: "best", label: "Best selling" },
    { value: "new", label: "New arrivals" },
  ];

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter(x => x !== v) : [...list, v]);
  const apply = () => { setFilterCategory(draftCategory); setSizes(draftSizes); setColors(draftColors); resetPage(); setPanel(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const surprise = () => { if (filteredProducts.length) router.push(`/product/${filteredProducts[Math.floor(Math.random() * filteredProducts.length)].id}`); };

  const pageTitle = sort === "new" && !filterCategory ? "New Drops" : filterCategory ? (categories.find(c => c.slug === filterCategory)?.name ?? filterCategory.replace(/-/g, " ")) : "All Clothing";

  const sidebar = (
    <aside className="text-bone">
      <div className="relative mb-6">
        <input type="text" placeholder={t("search_placeholder") || "Search products..."} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); resetPage(); }} className="field !border-white/20 pl-9" />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f23a]" />
      </div>
      <Section title="Sort By" open={open.sort} onToggle={() => setOpen(o => ({ ...o, sort: !o.sort }))}>
        {sortOptions.map(o => (
          <button key={o.value} onClick={() => { setSort(sort === o.value ? "" : o.value); resetPage(); }} className={`block text-left text-[11px] transition hover:text-bone ${sort === o.value ? "border-b border-[#00f23a] text-bone" : "text-white/55"}`}>{o.label}</button>
        ))}
      </Section>
      <p className="pb-2 text-[11px] text-white/60">Filter by:</p>
      <Section title="Category" open={open.category} onToggle={() => setOpen(o => ({ ...o, category: !o.category }))}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {categories.map(c => <Check key={c.id} checked={draftCategory === c.slug} onChange={() => setDraftCategory(draftCategory === c.slug ? null : c.slug)} label={<span className="capitalize">{c.name}</span>} />)}
        </div>
      </Section>
      {allSizes.length > 0 && (
        <Section title="Size" open={open.size} onToggle={() => setOpen(o => ({ ...o, size: !o.size }))}>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(s => <button key={s} onClick={() => toggle(draftSizes, setDraftSizes, s)} aria-pressed={draftSizes.includes(s)} className={`grid h-8 min-w-9 place-items-center rounded-[4px] border px-2 text-[11px] ${draftSizes.includes(s) ? "border-[#00f23a] bg-[#00f23a] font-bold text-black" : "border-white/20 bg-[#161616] text-white/70"}`}>{s}</button>)}
          </div>
        </Section>
      )}
      {allColors.length > 0 && (
        <Section title="Color" open={open.color} onToggle={() => setOpen(o => ({ ...o, color: !o.color }))}>
          <div className="flex flex-wrap gap-2">
            {allColors.map(c => <button key={c} title={c} aria-label={c} aria-pressed={draftColors.includes(c)} onClick={() => toggle(draftColors, setDraftColors, c)} className={`h-6 w-6 rounded-full border-2 ${draftColors.includes(c) ? "border-[#00f23a]" : "border-white/30"}`} style={{ background: swatch(c) }} />)}
          </div>
        </Section>
      )}
      <div className="mt-6 space-y-3">
        <button onClick={apply} className="btn-green w-full py-3">Apply filter</button>
        <button onClick={surprise} className="btn-outline w-full py-3">Surprise me</button>
      </div>
    </aside>
  );

  if (loading) {
    return (
      <section className="site-container py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      </section>
    );
  }

  return (
    <section className="site-container py-8 md:py-10">
      {/* VIEW AS (desktop) */}
      <div className="mb-8 hidden items-center justify-center gap-3 text-[10px] uppercase text-white/70 md:flex">
        View as:
        <button onClick={() => setDense(false)} aria-pressed={!dense} aria-label="3 columns" className={`flex gap-[3px] border p-1.5 ${!dense ? "border-[#00f23a]" : "border-[#00f23a]/40"}`}>{[0, 1, 2].map(i => <span key={i} className={`h-5 w-1.5 ${!dense ? "bg-[#00f23a]" : "bg-[#00f23a]/40"}`} />)}</button>
        <button onClick={() => setDense(true)} aria-pressed={dense} aria-label="4 columns" className={`flex gap-[3px] border p-1.5 ${dense ? "border-[#00f23a]" : "border-[#00f23a]/40"}`}>{[0, 1, 2, 3].map(i => <span key={i} className={`h-5 w-1 ${dense ? "bg-[#00f23a]" : "bg-[#00f23a]/40"}`} />)}</button>
      </div>

      <div className="grid gap-8 md:grid-cols-[210px_1fr] md:gap-10">
        <div>
          <div className="flex items-center justify-between md:block">
            <h1 className="section-title capitalize md:mb-8">{pageTitle}</h1>
            <button onClick={() => setPanel(v => !v)} className="btn-outline px-3 py-2 md:hidden" aria-expanded={panel}>{panel ? <X size={14} /> : <SlidersHorizontal size={14} />} Filters</button>
          </div>
          <div className={`${panel ? "mt-5 block" : "hidden"} md:block`}>{sidebar}</div>
        </div>

        <div>
          {visibleProducts.length === 0 ? (
            <p className="py-16 text-center text-white/50">{t("search_no_results") || "No products found."}</p>
          ) : (
            <>
              <ProductGrid products={visibleProducts} dense={dense} />
              <Paginator page={safePage} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAGE SHELL ---------------- */

export default function ProductsClient() {
  return (
    <div className="page-shell">
      <Header />
      <div className="flex-1">
        <Suspense fallback={<section className="site-container py-10"><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />)}</div></section>}>
          <ProductsContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
