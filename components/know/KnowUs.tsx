"use client";

import { useState } from "react";
import { Facebook, Instagram, Mail, Phone, Minus, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import NewsletterForm from "@/components/home/NewsletterForm";

type Tab = "about" | "contact" | "faqs" | "shipping";
const tabs: { id: Tab; label: string }[] = [
  { id: "about", label: "About Us" }, { id: "contact", label: "Contact Us" }, { id: "faqs", label: "FAQs" }, { id: "shipping", label: "Shipping and returns" },
];

const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
const mail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const socials = [
  { name: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL, Icon: Facebook },
  { name: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, Icon: Instagram },
  { name: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL, Icon: null },
];

function Accordion({ items, numbered }: { items: { q: string; a: React.ReactNode }[]; numbered?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center gap-4 py-4 text-left">
              {numbered && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#202020] text-[10px] text-bone">{String(i + 1).padStart(2, "0")}</span>}
              <span className={`flex-1 text-xs ${isOpen ? "text-[#00f23a]" : "font-semibold text-bone"}`}>{it.q}</span>
              {isOpen ? <Minus size={14} className="text-[#00f23a]" /> : <Plus size={14} className="text-bone" />}
            </button>
            {isOpen && <div className={`pb-4 text-[11px] leading-5 text-bone/65 ${numbered ? "pl-12" : ""}`}>{it.a}</div>}
            <div className="green-line" />
          </div>
        );
      })}
    </div>
  );
}

export default function KnowUs() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const active = (tabs.find(x => x.id === params.get("tab"))?.id ?? "about") as Tab;
  const go = (id: Tab) => router.replace(id === "about" ? "/about" : `/about?tab=${id}`, { scroll: false });

  const our = [1, 2, 3, 4].map(n => ({ q: t(`faq_our_q${n}` as any), a: t(`faq_our_a${n}` as any) }));
  const deposit = [1, 2, 3, 4].map(n => ({ q: t(`faq_deposit_q${n}` as any), a: t(`faq_deposit_a${n}` as any) }));
  const delivery = [
    { q: t("faq_delivery_q1" as any), a: <>{t("faq_delivery_a1_p1" as any)} {t("faq_delivery_a1_li1" as any)} {t("faq_delivery_a1_li2" as any)} {t("faq_delivery_a2" as any)}</> },
    { q: t("faq_delivery_q2" as any), a: t("faq_delivery_a2" as any) },
  ];
  const returns = [
    { q: t("faq_return_q1" as any), a: t("faq_return_a1" as any) },
    { q: t("faq_return_q2" as any), a: <>{t("faq_return_a2_p1" as any)} {t("faq_return_a2_li1" as any)} {t("faq_return_a2_li2" as any)} {t("faq_return_a2_li3" as any)} {t("faq_return_no_trying" as any)}</> },
  ];
  const faqs = [...our, ...deposit];
  const ship = [...delivery, ...returns];
  const half = (list: typeof faqs) => [list.slice(0, Math.ceil(list.length / 2)), list.slice(Math.ceil(list.length / 2))];

  const h = "text-lg font-bold text-bone md:text-xl";
  const p = "mt-4 text-[11px] leading-6 text-bone/70 md:text-xs";

  return (
    <main className="site-container flex-1 py-10 md:py-14">
      <h1 className="text-center text-2xl font-bold text-bone md:text-3xl">Get To Know Us</h1>

      <nav aria-label="Know us" className="no-scrollbar mx-auto mt-8 flex max-w-xl justify-start gap-6 overflow-x-auto px-1 md:mt-12 md:justify-center md:gap-10">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => go(tab.id)} aria-current={active === tab.id} className={`shrink-0 border-b pb-1 text-[11px] font-semibold transition md:text-xs ${active === tab.id ? "border-[#00f23a] text-[#00f23a]" : "border-transparent text-bone/55 hover:text-bone"}`}>{tab.label}</button>
        ))}
      </nav>

      <div className="mt-10 md:mt-16">
        {active === "about" && (
          <>
            <div className="grid gap-10 md:grid-cols-2 md:gap-x-20 md:gap-y-14">
              <section>
                <h2 className={h}>What makes us special?</h2>
                <div className="mt-4 space-y-5 text-[11px] leading-6 text-bone/75 md:text-xs">
                  <p><b className="text-[#00f23a]">Exclusive Collections;</b> Unique fashion designed in-house by Encrypted, all in one place.</p>
                  <p><b className="text-[#00f23a]">Custom Modeling;</b> Choose a model that matches your body type to see how clothes fit before you buy.</p>
                  <p><b className="text-[#00f23a]">Personalized Recommendations;</b> Get tailored style suggestions based on your preferences and our latest drops.</p>
                </div>
              </section>
              <section><h2 className={h}>Our story</h2><p className={p}>{t("about_story_p1" as any)} {t("about_story_p2" as any)}</p></section>
              <section><h2 className={h}>Our Quality</h2><p className={p}>{t("about_affordable_desc" as any)}</p></section>
              <section><h2 className={h}>Why local?</h2><p className={p}>{t("about_what_we_believe_desc" as any)}</p></section>
              <section><h2 className={h}>Our mission</h2><p className={p}>{t("about_mission_desc" as any)}</p></section>
            </div>
            <p className="mt-16 text-center text-base text-[#00f23a] md:mt-24 md:text-xl">Designed in Cairo. Decoded for you.</p>
          </>
        )}

        {active === "contact" && (
          <>
            <div className="mx-auto grid max-w-3xl gap-10 md:grid-cols-2 md:gap-16">
              <section>
                <h2 className="text-sm font-semibold text-bone">For Customers :</h2>
                <ul className="mt-5 space-y-5 text-[11px] text-bone">
                  {phone && <li className="flex items-center gap-3"><Phone size={13} className="text-[#00f23a]" /><a href={`tel:${phone}`}>{phone}</a></li>}
                  {mail && <li className="flex items-center gap-3"><Mail size={13} className="text-[#00f23a]" /><a href={`mailto:${mail}`}>{mail}</a></li>}
                  {!phone && !mail && <li className="text-bone/55">Reach us on social media below.</li>}
                </ul>
              </section>
              <section>
                <h2 className="text-sm font-semibold text-bone">Social Media :</h2>
                <ul className="mt-5 space-y-5 text-[11px] text-bone">
                  {socials.filter(s => s.href).map(({ name, href, Icon }) => (
                    <li key={name}><a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#00f23a]">{Icon ? <Icon size={13} className="text-[#00f23a]" /> : <span className="text-[10px] font-bold text-[#00f23a]">♪</span>}Encrypted · {name}</a></li>
                  ))}
                  {!socials.some(s => s.href) && <li className="text-bone/55">Links coming soon.</li>}
                </ul>
              </section>
            </div>
            <div className="mx-auto mt-14 max-w-3xl">
              <h2 className="text-sm font-semibold text-[#00f23a]">Newsletter</h2>
              <p className="mt-4 max-w-sm text-[11px] leading-5 text-bone">By subscribing to our mailing list you will always be updated with the latest news from us</p>
              <div className="mt-6 max-w-md"><NewsletterForm /></div>
            </div>
            <p className="mt-16 text-center text-base text-[#00f23a] md:mt-24 md:text-xl">Say Hi, We Listen!</p>
          </>
        )}

        {(active === "faqs" || active === "shipping") && (
          <>
            <div className="mx-auto grid max-w-5xl gap-x-16 md:grid-cols-2">
              {half(active === "faqs" ? faqs : ship).map((col, i) => <Accordion key={`${active}-${i}`} items={col} numbered={active === "faqs"} />)}
            </div>
            <p className="mt-14 text-center text-base text-[#00f23a] md:mt-20 md:text-xl">{active === "faqs" ? "Your FAQs, answered!" : "Shop with confidence, easy returns guaranteed."}</p>
          </>
        )}
      </div>
    </main>
  );
}
