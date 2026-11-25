"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactForm() {
  const { order, setOrder, errors, setErrors } = useCheckout();
  const { t } = useLanguage();

  const handleEmailChange = (value: string) => {
    setOrder(prev => ({ ...prev, contact: { email: value.trim() } }));
    setErrors(prev => ({ ...prev, email: undefined }));
  };

  const validateEmail = (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErrors(prev => ({ ...prev, email: t("checkout_contact_invalid_email") }));
  };

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold text-bone">{t("checkout_contact")}</h2>
      <label htmlFor="co-email" className="field-label">Email Address</label>
      <input id="co-email" type="email" value={order.contact.email} onChange={(e) => handleEmailChange(e.target.value)} onBlur={() => validateEmail(order.contact.email)} placeholder={t("checkout_contact_placeholder")} className={`field max-w-xs ${errors.email ? "!border-red-500" : ""}`} />
      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
    </div>
  );
}
