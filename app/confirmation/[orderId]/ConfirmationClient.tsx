"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Order } from "@/data/order";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function ConfirmationClient() {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        // ✅ Calls API route (REST API) to avoid Firestore SDK channels
        const res = await fetch(`/api/orders?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const Wrap = ({ children }: { children: React.ReactNode }) => <div className="page-shell text-bone"><Header />{children}<Footer /></div>;
  if (loading) return <Wrap><p className="site-container flex-1 py-16 text-bone/60">{t("confirmation_loading")}</p></Wrap>;
  if (!order) return <Wrap><p className="site-container flex-1 py-16 text-bone/60">{t("confirmation_not_found")}</p></Wrap>;

  const { items = [], delivery, payment = {} as any, totals = { subtotal: 0, shipping: 0, total: 0 }, createdAt } = order;
  const dateObj = createdAt ? (typeof createdAt === 'number' ? new Date(createdAt) : (createdAt as any).seconds ? new Date((createdAt as any).seconds * 1000) : new Date(createdAt)) : new Date();
  const h4 = "mb-2 text-sm font-bold text-bone";
  const val = "text-sm leading-relaxed text-bone/75";

  return (
    <Wrap>
      <section className="site-container grid flex-1 gap-14 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-24 lg:py-16">
        {/* LEFT */}
        <div className="space-y-8 lg:pl-10">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#00f23a] text-ink"><Check size={26} strokeWidth={3} /></div>
            <h1 className="text-xl font-bold text-bone">{t("confirmation_title")}</h1>
          </div>
          <p className="text-sm font-medium leading-relaxed text-bone">
            {t("confirmation_thank_you")} <span className="text-[#00f23a]">{delivery?.firstName}</span> {t("confirmation_for_order")}.<br />
            {t("confirmation_check_email")}
          </p>

          <div className="grid grid-cols-2 gap-5 rounded-xl border border-bone/10 bg-[#050705] p-5 md:grid-cols-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-bone/40">{t("orders_order_id")}</p><p className="mt-1 text-sm font-medium">#{orderId.slice(-6).toUpperCase()}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-bone/40">{t("orders_date")}</p><p className="mt-1 text-sm font-medium">{dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p></div>
            <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-bone/40">{t("confirmation_email")}</p><p className="mt-1 truncate text-sm font-medium" title={order.contact?.email}>{order.contact?.email}</p></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-bone/40">{t("orders_details")}</p><span className="mt-1 inline-block rounded-full border border-[#00f23a]/50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#00f23a]">{t(`status_${order.status || "pending"}` as any)}</span></div>
          </div>

          <div>
            <h4 className={h4}>Shipping Address</h4>
            <p className={val}>
              {delivery?.firstName} {delivery?.lastName}<br />
              {delivery?.address}{delivery?.apartment && `, ${delivery.apartment}`}<br />
              {delivery?.city}{delivery?.government ? `, ${delivery.government}` : ""}
            </p>
          </div>
          <div>
            <h4 className={h4}>Mobile Phone</h4>
            <p className={val}>{delivery.phone}</p>
            {delivery.secondPhone && <p className="mt-1 text-xs text-bone/45">{t("checkout_second_phone")}: {delivery.secondPhone}</p>}
          </div>
          <div>
            <h4 className={h4}>Pick-up date</h4>
            <p className={val}>{t("confirmation_pickup_desc")}<br /><span className="text-xs text-bone/45">({t("confirmation_excluding_days")})</span></p>
          </div>
          <div>
            <h4 className={h4}>Payment Method</h4>
            <p className={val}>{payment?.method === "cod" ? t("checkout_cod") : t("checkout_online")}</p>

            {payment?.depositType && (
              <div className="mt-4 space-y-3 rounded-xl border border-[#00f23a]/30 bg-[#050705] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#00f23a]">{payment?.depositType === "deposit" ? t("confirmation_deposit_paid") : t("confirmation_full_paid")}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${payment?.paid ? "bg-[#00f23a]/15 text-[#00f23a]" : "bg-amber-400/15 text-amber-300"}`}>
                    {payment?.paid ? `✓ ${t("confirmation_confirmed")}` : `⏳ ${t("confirmation_awaiting")}`}
                  </span>
                </div>
                {payment?.depositAmount && (
                  <div className="flex justify-between border-t border-bone/10 pt-3 text-xs"><p className="text-bone/55">{t("confirmation_amount_paid")}</p><p className="font-bold text-[#00f23a]">EGP {payment.depositAmount.toLocaleString()}</p></div>
                )}
                {payment?.depositType === "deposit" && payment?.depositAmount && (
                  <div className="flex justify-between text-xs"><p className="text-bone/55">{t("confirmation_remaining")}</p><p className="font-bold text-bone">EGP {((totals?.total ?? 0) - (payment?.depositAmount ?? 0)).toLocaleString()}</p></div>
                )}
              </div>
            )}

            {payment?.paymentPhotoUrl && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-medium uppercase tracking-widest text-bone/45">{t("confirmation_screenshot")}</p>
                <a href={payment.paymentPhotoUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-video w-full max-w-sm overflow-hidden rounded-xl border border-bone/10">
                  <Image src={payment.paymentPhotoUrl} alt="Payment receipt" fill className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100"><span className="rounded-full bg-[#00f23a] px-4 py-2 text-[10px] font-bold uppercase text-ink">{t("confirmation_view_full")}</span></div>
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-2 border-t border-bone/10 pt-6 text-[10px] font-medium uppercase tracking-widest text-bone/35">
            <div>{t("orders_order_id")}: {orderId}</div>
            <div>{t("orders_date")}: {createdAt ? new Date(typeof createdAt === "number" ? createdAt : (createdAt as any).seconds * 1000).toLocaleString("en-GB") : "N/A"}</div>
          </div>
        </div>

        {/* RIGHT – ORDER SUMMARY */}
        <div>
          <h2 className="page-title mb-8 text-center">{t("checkout_order_summary")}</h2>
          <ul className="space-y-6">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className="relative h-24 w-[88px] shrink-0">
                  <div className="relative h-full w-full overflow-hidden rounded-xl bg-white"><Image src={item.image} alt={item.title} fill className="object-cover" sizes="88px" /></div>
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#d5d5d5] text-xs font-medium text-ink">{item.qty}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium uppercase">{item.title}</p>
                  {item.variant && <p className="mt-2 text-xs text-[#00f23a]">{item.variant}</p>}
                </div>
                <p className="shrink-0 text-xs font-medium text-[#00f23a]">EGP {item.price * item.qty}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-4 text-lg">
            <div className="flex justify-between"><span>{t("checkout_subtotal")}</span><span className="text-[#00f23a]">EGP {totals.subtotal}</span></div>
            <div className="flex justify-between"><span>{t("checkout_shipping")}</span><span className="text-[#00f23a]">EGP {totals.shipping}</span></div>
            {!!totals.discount && <div className="flex justify-between text-base"><span>{order.coupon?.code}</span><span className="text-[#00f23a]">- EGP {totals.discount}</span></div>}
          </div>
          <div className="my-5 h-px bg-bone/30" />
          <div className="flex justify-between text-lg"><span>{t("checkout_total")}</span><span className="text-[#00f23a]">EGP {totals.total}</span></div>
        </div>
      </section>
    </Wrap>
  );
}
