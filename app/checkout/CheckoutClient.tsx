"use client";

import PromoCode from "@/components/checkout/PromoCode";
import ContactForm from "../../components/checkout/ContactForm";
import DeliveryForm from "../../components/checkout/DeliveryForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import { useCheckout } from "../../context/CheckoutContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckoutClient() {
  const { items } = useCart();
  const { order, setOrder, setErrors, quote, quoteError, quoteLoading } = useCheckout();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/checkout&message=Please login to your account to complete your purchase.");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      items,
    }));
  }, [items, setOrder]);
  const isFormValid =
    !!quote && !quoteError && !quoteLoading &&
    !!order.contact.email &&
    !!order.delivery.address &&
    !!order.delivery.phone &&
    !!order.delivery.firstName &&
    !!order.delivery.lastName &&
    !!order.delivery.city &&
    !!order.delivery.apartment &&
    !!order.delivery.secondPhone &&
    !!order.payment &&
    order.items.length > 0;

  const proceedToPayment = () => {
    const newErrors: Record<string, string> = {};

    if (!order.contact.email) newErrors.email = t("error_email_required");
    if (!order.delivery.address) newErrors.address = t("error_address_required");
    
    if (!order.delivery.phone) newErrors.phone = t("error_phone_required");
    else if (!/^01[0-9]{9}$/.test(order.delivery.phone)) newErrors.phone = t("checkout_invalid_phone");

    if (!order.delivery.secondPhone) newErrors.secondPhone = t("error_phone_required");
    else if (!/^01[0-9]{9}$/.test(order.delivery.secondPhone)) newErrors.secondPhone = t("checkout_invalid_phone");

    if (!order.delivery.firstName) newErrors.firstName = t("error_first_name_required");
    if (!order.delivery.lastName) newErrors.lastName = t("error_last_name_required");
    if (!order.delivery.city) newErrors.city = t("error_city_required");
    if (!order.delivery.apartment) newErrors.apartment = t("error_apartment_required");
    if (!order.payment) newErrors.payment = t("error_payment_required");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Route to upload page — order is submitted there after attaching photo
    router.push("/checkout/payment-upload");
  };

  if (loading) {
    return (
      <div className="page-shell items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00f23a]" />
      </div>
    );
  }

  return (
    <div className="page-shell text-bone">
      <Header />
      <section className="site-container grid flex-1 gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-20 lg:py-14">
        <div className="space-y-12">
          <ContactForm />
          <DeliveryForm />
        </div>

        <div className="space-y-10">
          <OrderSummary>
            <PromoCode />
          </OrderSummary>
          <PaymentMethod />
          <p className="flex items-center gap-2 border-l-2 border-[#00f23a] pl-3 font-[family-name:var(--font-terminal)] text-lg tracking-[.08em] text-[#00f23a]">&gt; Zero trust, but you can trust us.</p>
          <div>
            {quoteError && <p role="alert" className="mb-3 text-sm text-red-400">{quoteError}</p>}
            {quoteLoading && <p role="status" className="mb-3 text-sm text-bone/60">Validating checkout...</p>}
            <button onClick={proceedToPayment} disabled={!isFormValid} className="btn-green w-full !py-4 !text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[320px]">
              {t("checkout_save_proceed")}
            </button>
            {!isFormValid && <p className="mt-3 text-xs text-bone/45">{t("checkout_complete_fields")}</p>}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
