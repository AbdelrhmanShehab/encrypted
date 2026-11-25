import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import MobileLanding from "@/components/home/MobileLanding";
import NewArrivals from "@/components/home/NewArrivals";
import BestSeller from "@/components/home/BestSeller";
import {
  fetchCategories,
  fetchNewArrivals,
  fetchBestSellers,
} from "@/lib/firestore-server";
import { Product } from "@/data/product";
import type { Metadata } from "next";
import Script from "next/script";
import ErrorBoundary from "@/components/ErrorBoundary";
import CatalogRetry from "@/components/home/CatalogRetry";
import { loadHomeData } from "@/lib/home-data";
import BrandSignal from "@/components/home/BrandSignal";
import Services from "@/components/home/Services";
import Newsletter from "@/components/home/Newsletter";
import { isMenswearCategory, isMenswearProduct } from "@/lib/menswear";

export const metadata: Metadata = {
  title: { absolute: "Encrypted | Menswear, decoded." },
  description:
    "Shop Encrypted: Egyptian menswear, streetwear and everyday essentials designed in Cairo.",
  openGraph: {
    title: "Encrypted | Menswear, decoded.",
    description:
      "Shop Encrypted: Egyptian menswear, streetwear and everyday essentials designed in Cairo.",
  },
};

export default async function Home() {
  // Keep the storefront available if one or more catalog requests fail.
  const { categories, newArrivals, bestSellers, unavailable } = await loadHomeData({
    categories: fetchCategories,
    newArrivals: () => fetchNewArrivals(20),
    bestSellers: () => fetchBestSellers(8),
  });
  const menswearCategories = categories.filter(isMenswearCategory);
  const menswearNewArrivals = newArrivals.filter(product => isMenswearProduct(product as Product, categories));
  const menswearBestSellers = bestSellers.filter(product => isMenswearProduct(product as Product, categories));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Encrypted",
        description:
          "An Egyptian menswear brand: streetwear and everyday essentials.",
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        name: "Encrypted",
        logo: {
          "@type": "ImageObject",
          url: "/encrypted-symbol.png",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="home-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <MobileLanding products={menswearNewArrivals.slice(0, 4) as Product[]} />
      <ErrorBoundary fallback={null}>
        <Hero products={menswearNewArrivals.slice(0, 4) as Product[]} />
      </ErrorBoundary>
      <BrandSignal />
      <main className="mainContainer">
        {unavailable && <CatalogRetry />}
        <ErrorBoundary fallback={null}>
          <BestSeller products={menswearBestSellers as Product[]} />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <NewArrivals products={menswearNewArrivals as Product[]} />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Services />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Categories categories={menswearCategories} />
        </ErrorBoundary>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
