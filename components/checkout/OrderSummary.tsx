"use client";

import type { ReactNode } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

/** Items, then `children` (promo code), then the totals. */
export default function OrderSummary({ children }: { children?: ReactNode }) {
  const { order, shippingFee, quote } = useCheckout();
  const { t } = useLanguage();

  const subtotal = quote?.totals.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = shippingFee;
  const discount = quote?.totals.discount || 0;
  const total = quote?.totals.total ?? subtotal + shipping;

  return (
    <div>
      {order.items.length === 0 ? (
        <p className="text-sm text-bone/50">{t("checkout_order_summary")}</p>
      ) : (
        <ul className="space-y-6">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-4">
              <div className="relative h-24 w-[88px] shrink-0">
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-white">
                  <Image src={item.image || "/1.png"} alt={item.title} fill sizes="88px" className="object-cover" />
                </div>
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#d5d5d5] text-xs font-medium text-ink">{item.qty}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium uppercase text-bone">{item.title}</p>
                <p className="mt-2 text-xs text-[#00f23a]">{item.size} / {item.color}</p>
              </div>
              <p className="shrink-0 text-xs font-medium text-[#00f23a]">EGP {(item.price * item.qty).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      {children && <div className="mt-8">{children}</div>}

      <div className="mt-8 space-y-4 text-lg">
        <div className="flex justify-between"><span>{t("checkout_subtotal")}</span><span className="text-[#00f23a]">EGP {subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>{t("checkout_shipping")}</span><span className="text-[#00f23a]">EGP {shipping}</span></div>
        {discount > 0 && <div className="flex justify-between text-base"><span>{order.couponCode}</span><span className="text-[#00f23a]">- EGP {discount.toLocaleString()}</span></div>}
      </div>
      <div className="my-5 h-px bg-bone/30" />
      <div className="flex justify-between text-lg"><span>{t("checkout_total")}</span><span className="text-[#00f23a]">EGP {total.toLocaleString()}</span></div>
    </div>
  );
}
