"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileOverview from "@/components/account/ProfileOverview";
import OrderHistory from "@/components/account/OrderHistory";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountClient() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("tab") === "orders") setTab("orders"); }, []);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login?redirect=/account");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="page-shell items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00f23a]" />
      </div>
    );
  }

  const tabs = [{ id: "profile", label: "My Profile" }, { id: "orders", label: "My Orders" }] as const;

  return (
    <div className="page-shell text-bone">
      <Header />
      <main className="site-container flex-1 py-8 md:py-14">
        <div className="grid gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-16 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="md:border-r md:border-bone/10 md:pr-6">
            <h2 className="mb-5 text-lg font-bold tracking-[.2em] text-bone/60 md:mb-8">Settings</h2>
            <nav className="flex gap-6 md:flex-col md:gap-7">
              {tabs.map((x) => (
                <button key={x.id} onClick={() => setTab(x.id)} aria-current={tab === x.id} className={`w-fit border-b-2 pb-1 text-sm font-medium transition ${tab === x.id ? "border-[#00f23a] text-[#00f23a]" : "border-transparent text-bone/60 hover:text-bone"}`}>{x.label}</button>
              ))}
              <button onClick={handleLogout} className="w-fit pb-1 text-sm font-medium text-bone/60 transition hover:text-red-400 md:mt-6">{t("account_sign_out")}</button>
            </nav>
          </aside>

          <div className="min-w-0 max-w-3xl">
            <h1 className="text-xl font-bold text-bone">{tab === "profile" ? "Account Settings" : "Orders History"}</h1>
            <p className="mt-1 text-xs text-bone/55">{tab === "profile" ? "Settings and options for your account" : "Your previous orders"}</p>
            <div className="my-6 h-px bg-bone/10" />
            {tab === "profile" ? <ProfileOverview /> : <OrderHistory />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
