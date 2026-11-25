"use client";

import { memo } from "react";
import type { Product } from "../data/product";
import ProductCard from "./ProductCard";

type Props = { products: Product[]; dense?: boolean; className?: string };

const ProductGrid = memo(function ProductGrid({ products, dense = false, className }: Props) {
  if (!products || products.length === 0) return <p className="text-center text-white/50">No products found.</p>;
  const cols = dense ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";
  return (
    <div className={className ?? `grid gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 ${cols}`}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
});

export default ProductGrid;
