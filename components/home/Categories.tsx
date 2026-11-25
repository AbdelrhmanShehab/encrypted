"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type Category = { id: string; name: string; slug: string; image?: string };

export default function Categories({ categories }: { categories: Category[] }) {
  const { t } = useLanguage();
  const list = (categories ?? []).filter(c => c && typeof c === "object" && typeof c.slug === "string").slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section id="styles" className="site-container scroll-mt-28 py-12 md:py-20" aria-label="Shop by style">
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 pt-3 md:mx-0 md:grid md:grid-cols-3 md:gap-10 md:overflow-visible md:px-0">
        {list.map((cat, i) => {
          const key = `category_${cat.slug.toLowerCase().replace(/-/g, "_")}` as any;
          const translated = t(key);
          const title = typeof translated === "string" && translated !== key ? translated : cat.name;
          return (
            <Link key={cat.id || i} href={`/products?category=${cat.slug}`} className="group relative block w-[72%] shrink-0 snap-center sm:w-[46%] md:w-auto">
              <span className="absolute -right-3 -top-3 h-full w-[88%] bg-[#0b6b1d] transition group-hover:bg-[#00f23a]/80" aria-hidden />
              <span className="relative block aspect-[4/5] overflow-hidden bg-[#0c110d]">
                {cat.image ? <Image src={cat.image} alt={title} fill sizes="(max-width: 768px) 72vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <span className="cyber-grid absolute inset-0" />}
              </span>
              <span className="absolute -bottom-4 left-1/2 w-[62%] -translate-x-1/2 bg-[#00f23a] py-2 text-center text-sm font-medium capitalize text-ink shadow-[0_0_24px_rgba(0,242,58,.5)] transition group-hover:bg-bone">{title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
