"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, ArrowLeft, LogIn } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Suspense } from "react";

function LoginRequiredContent() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <div className="page-shell text-bone">
      <Header />
      <div className="site-container flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-bone/10 bg-[#050705] p-8 text-center shadow-[0_0_50px_rgba(0,242,58,.06)] md:p-12">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#00f23a]/40 bg-[#00f23a]/10">
            <Heart className="h-11 w-11 fill-[#00f23a] text-[#00f23a]" />
          </div>

          <div className="space-y-3">
            <h1 className="page-title">{t("login_required_title")}</h1>
            <p className="text-sm leading-relaxed text-bone/60 md:text-base">{t("login_required_desc")}</p>
          </div>

          <div className="space-y-4 pt-2">
            <button onClick={handleLogin} className="btn-green w-full !py-4 !text-sm">
              <LogIn className="h-5 w-5" />
              {t("login_required_btn")}
            </button>
            <Link href="/" className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-bone/55 transition hover:text-[#00f23a]">
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("login_required_back")}
            </Link>
          </div>

          <p className="pt-2 text-[10px] uppercase tracking-widest text-bone/35">Encrypted — {t("footer_tagline")}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function LoginRequiredClient() {
  return (
    <Suspense fallback={
      <div className="page-shell items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00f23a]"></div>
      </div>
    }>
      <LoginRequiredContent />
    </Suspense>
  );
}
