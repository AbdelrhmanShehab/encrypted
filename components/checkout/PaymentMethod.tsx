"use client";
import { useCheckout } from "../../context/CheckoutContext";
import { useLanguage } from "@/context/LanguageContext";

export default function PaymentMethod() {
  const { order, setOrder, errors } = useCheckout();
  const { t } = useLanguage();
  const opts: { id: "cod" | "online"; label: string }[] = [
    { id: "cod", label: t("checkout_cod") },
    { id: "online", label: t("checkout_online") },
  ];

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-bone">{t("checkout_payment")}</h2>
      <div role="radiogroup" className="space-y-4">
        {opts.map((o) => {
          const on = order.payment === o.id;
          return (
            <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setOrder({ ...order, payment: o.id })} className="flex w-full items-center gap-3 text-left text-sm">
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-[#00f23a]" : "border-[#00f23a]/70"}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-[#00f23a]" />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
      {(errors as any).payment && <p className="mt-2 text-xs text-red-400">{(errors as any).payment}</p>}
    </div>
  );
}
