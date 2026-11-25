import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse independent Egyptian menswear, streetwear, and everyday essentials. Filter by category or sort by new drops and best sellers.",
  openGraph: {
    title: "Shop Menswear | Encrypted",
    description:
      "Browse independent Egyptian menswear, streetwear, and everyday essentials on Encrypted.",
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
