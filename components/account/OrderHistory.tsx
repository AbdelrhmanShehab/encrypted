"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function OrderHistory() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch(`/api/orders?uid=${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00f23a]" /></div>;

  if (orders.length === 0) return (
    <div>
      <p className="text-xs text-bone">{t("orders_no_orders")}</p>
      <Link href="/products" className="btn-green mt-6 !px-8 !py-3.5 !text-sm">Shop Now</Link>
    </div>
  );

  const statusCls = (s: string) => s === "delivered" ? "border-[#00f23a]/60 text-[#00f23a]" : s === "pending" ? "border-amber-300/50 text-amber-300" : "border-bone/30 text-bone/70";

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        return (
          <div key={order.id} className="overflow-hidden rounded-xl border border-bone/10 bg-[#050705]">
            <button type="button" className="block w-full p-5 text-left" onClick={() => toggleOrder(order.id)} aria-expanded={isExpanded}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-bone/45">{t("orders_order_id")}</span>
                  <span className="font-mono text-sm font-bold uppercase text-bone">#{order.id.slice(-8)}</span>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-bone/45">{t("orders_date")}</span>
                  <span className="text-sm text-bone/75">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-bone/45">{t("orders_total_amount")}</span>
                  <span className="text-lg font-bold text-[#00f23a]">EGP {order.totals?.total || order.total}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusCls(order.status)}`}>{order.status}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#00f23a]">
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? t("orders_hide") : t("orders_details")}
                  </span>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="space-y-6 border-t border-bone/10 bg-ink p-5">
                <div>
                  <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-bone/45">{t("orders_items_purchased")}</h4>
                  <div className="space-y-3">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 rounded-lg border border-bone/10 bg-[#050705] p-3">
                        {item.image && (
                          <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = "/1.png"; }} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-bone">{item.title}</p>
                          <p className="mt-1 text-xs text-[#00f23a]">{item.size} / {item.color} · x{item.qty}</p>
                        </div>
                        <div className="whitespace-nowrap text-sm font-semibold text-[#00f23a]">EGP {item.price * item.qty}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 border-t border-bone/10 pt-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-bone/45">{t("orders_shipping_details")}</h4>
                    <div className="space-y-1.5 rounded-lg border border-bone/10 bg-[#050705] p-4 text-xs text-bone/75">
                      <p className="font-bold text-bone">{order.delivery?.firstName} {order.delivery?.lastName}</p>
                      <p>{order.delivery?.address}{order.delivery?.apartment ? `, ${order.delivery.apartment}` : ""}</p>
                      <p>{order.delivery?.city}{order.delivery?.government ? `, ${order.delivery.government}` : ""}</p>
                      <p className="pt-1 font-medium">{order.delivery?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-bone/45">{t("orders_order_summary")}</h4>
                    <div className="space-y-2 rounded-lg border border-bone/10 bg-[#050705] p-4">
                      <div className="flex justify-between text-xs"><span className="text-bone/55">{t("orders_subtotal")}</span><span className="text-[#00f23a]">EGP {order.totals?.subtotal}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-bone/55">{t("orders_shipping")}</span><span className="text-[#00f23a]">EGP {order.totals?.shipping}</span></div>
                      <div className="mt-2 flex justify-between border-t border-bone/15 pt-2 text-sm"><span className="font-bold">{t("orders_total_paid")}</span><span className="text-base font-bold text-[#00f23a]">EGP {order.totals?.total}</span></div>
                      <p className="pt-2 text-center text-[10px] text-bone/45">{t("orders_payment_prefix")} {order.payment?.method === "cod" ? t("orders_payment_cod") : order.payment?.method}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
