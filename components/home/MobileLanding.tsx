import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/product";
import BootHero from "./BootHero";

const TILES = ["Most Popular", "New Drops", "Men's Collection", "New Season Menswear"];

/** Mobile-only landing: title block, big hero image, then a 2-column grid of photo cards. Desktop keeps the mosaic hero. */
export default function MobileLanding({ products = [] }: { products?: Product[] }) {
  return (
    <>
      <BootHero>
      <section className="site-container bg-ink pb-8 pt-3 md:hidden">
      <div className="mt-2 grid grid-cols-2 gap-2">
        {TILES.map((label, i) => {
          const p = products[i];
          return (
            <Link key={label} href={p ? `/product/${p.id}` : "/products"} className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-[#0c110d]">
              {p?.images?.[0] && <Image src={p.images[0]} alt={p.title} fill sizes="50vw" className="object-cover transition duration-500 group-active:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold leading-tight text-bone">{label}</span>
            </Link>
          );
        })}
      </div>
      </section>
      </BootHero>
    </>
  );
}
