import Image from "next/image";
import TypeWriter from "./TypeWriter";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Product } from "@/data/product";

function PhotoTile({ product, label, className = "" }: { product?: Product; label: ReactNode; className?: string }) {
  return <Link href={product ? `/product/${product.id}` : "/products"} className={`hero-tile group ${className}`}>
    {product?.images?.[0] && <Image src={product.images[0]} alt={product.title} fill sizes="(max-width: 768px) 50vw, 24vw" className="object-cover transition duration-700 group-hover:scale-105"/>}
    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/10 transition group-hover:from-ink/55"/>
    <span className="hero-photo-title">{label}</span>
  </Link>;
}

export default function Hero({ products = [] }: { products?: Product[] }) {
  const [popular, fresh, feature, collection] = products;
  return <section className="hidden bg-ink py-5 md:block md:py-8">
    <div className="site-container hero-mosaic">
      <PhotoTile product={popular} label={<>Most<br/>Popular</>} className="hero-popular"/>
      <PhotoTile product={fresh} label={<>New<br/>Drops</>} className="hero-fresh"/>
      <div className="hero-tile hero-code">
        <Image src="/encrypted-mask-hero.png" alt="Anonymous mask, a symbol of digital resistance" fill sizes="(max-width: 768px) 40vw, 25vw" className="hero-mask"/>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink/30 to-ink"/>
        <p className="hero-code-copy"><TypeWriter lines={["Encrypted Style", "Decrypted for You"]} /></p>
      </div>
      <PhotoTile product={feature} label={<>Men's<br/>Collection</>} className="hero-men"/>
      <PhotoTile product={collection} label={<>New Season<br/>Menswear</>} className="hero-collection"/>
    </div>
  </section>;
}
