import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KnowUs from "@/components/know/KnowUs";

export const metadata: Metadata = {
  title: "Get To Know Us",
  description: "About Encrypted, contact details, FAQs and our shipping and returns policy.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Header />
      <Suspense fallback={<div className="flex-1" />}>
        <KnowUs />
      </Suspense>
      <Footer />
    </div>
  );
}
