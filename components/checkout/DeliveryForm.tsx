"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryForm() {
  const { order, setOrder, errors, setErrors, setShippingFee } = useCheckout();
  const { userData, user } = useAuth();
  const { t } = useLanguage();
  const [citiesData, setCitiesData] = useState<{ id: string; fee: number }[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("/api/cities");
        if (res.ok) {
          const cities = await res.json();
          setCitiesData(cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (order.delivery.city && citiesData.length > 0) {
      const selectedCity = citiesData.find(c => c.id === order.delivery.city);
      if (selectedCity) {
        setShippingFee(selectedCity.fee);
      }
    }
  }, [order.delivery.city, citiesData, setShippingFee]);

  const updateDelivery = (field: string, value: string) => {
    setOrder(prev => {
      const newOrder = {
        ...prev,
        delivery: {
          ...prev.delivery,
          [field]: value,
        },
      };

      if (field === "city") {
        const selectedCity = citiesData.find(c => c.id === value);
        if (selectedCity) {
          setShippingFee(selectedCity.fee);
        } else {
          setShippingFee(0);
        }
      }

      return newOrder;
    });

    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validatePhone = (phone: string | undefined, field: "phone" | "secondPhone") => {
    const regex = /^01[0-9]{9}$/; // Egyptian mobile format
    if (phone && !regex.test(phone)) {
      setErrors(prev => ({
        ...prev,
        [field]: t("checkout_invalid_phone"),
      }));
    }
  };

  const autoFillFromProfile = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/user-data?uid=${user.uid}`);
      if (!res.ok) return;
      const freshData = await res.json();

      const profileCity = freshData?.city || "";
      
      setOrder(prev => ({
        ...prev,
        contact: {
          email: freshData?.email || prev.contact.email || ""
        },
        delivery: {
          ...prev.delivery,
          address: freshData?.address || prev.delivery.address || "",
          phone: freshData?.phone || prev.delivery.phone || "",
          firstName: freshData?.firstName || prev.delivery.firstName || "",
          lastName: freshData?.lastName || prev.delivery.lastName || "",
          city: profileCity || prev.delivery.city || "",
          apartment: freshData?.apartment || prev.delivery.apartment || "",
          secondPhone: freshData?.secondPhone || prev.delivery.secondPhone || "",
        }
      }));

      // Manually trigger shipping fee update for the autofilled city
      if (profileCity && citiesData.length > 0) {
        const selectedCity = citiesData.find(c => c.id === profileCity);
        if (selectedCity) {
          setShippingFee(selectedCity.fee);
        }
      }

      // Clear form errors after filling
      setErrors({});
    } catch (error) {
      console.error("Error fetching fresh user data for autofill:", error);
    }
  };

  const err = (k: string) => (errors as any)[k] as string | undefined;
  const cls = (k: string) => `field ${err(k) ? "!border-red-500" : ""}`;
  const Err = ({ k }: { k: string }) => (err(k) ? <p className="mt-1 text-xs text-red-400">{err(k)}</p> : null);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-bone">Delivery</h2>
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-[11px] font-semibold uppercase tracking-widest text-bone/50 transition hover:text-[#00f23a]">{t("checkout_go_to_account")}</Link>
          {userData && (
            <button type="button" onClick={autoFillFromProfile} className="btn-outline !py-2 !text-[11px]">{t("checkout_fill_profile")}</button>
          )}
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-3">
        <div>
          <label className="field-label">Country</label>
          <select disabled value="Egypt" className="field cursor-not-allowed"><option>Egypt</option></select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">{t("checkout_address")}</label>
          <input value={order.delivery.address} onChange={(e) => updateDelivery("address", e.target.value)} className={cls("address")} placeholder={t("checkout_address_placeholder")} />
          <Err k="address" />
        </div>

        <div>
          <label className="field-label">{t("checkout_first_name")}</label>
          <input value={order.delivery.firstName} onChange={(e) => updateDelivery("firstName", e.target.value)} className={cls("firstName")} />
          <Err k="firstName" />
        </div>
        <div>
          <label className="field-label">{t("checkout_last_name")}</label>
          <input value={order.delivery.lastName} onChange={(e) => updateDelivery("lastName", e.target.value)} className={cls("lastName")} />
          <Err k="lastName" />
        </div>
        <div>
          <label className="field-label">{t("checkout_phone")}</label>
          <input value={order.delivery.phone} onChange={(e) => updateDelivery("phone", e.target.value)} onBlur={() => validatePhone(order.delivery.phone, "phone")} placeholder="01xxxxxxxxx" className={cls("phone")} />
          <Err k="phone" />
        </div>

        <div>
          <label className="field-label">{t("checkout_city")}</label>
          <select value={order.delivery.city} onChange={(e) => updateDelivery("city", e.target.value)} className={`${cls("city")} cursor-pointer`}>
            <option value="">{t("checkout_city_placeholder")}</option>
            {citiesData.map(city => <option key={city.id} value={city.id}>{city.id}</option>)}
          </select>
          <Err k="city" />
        </div>
        <div>
          <label className="field-label">Area</label>
          <input value={order.delivery.apartment} onChange={(e) => updateDelivery("apartment", e.target.value)} className={cls("apartment")} placeholder={t("checkout_apartment_placeholder")} />
          <Err k="apartment" />
        </div>
        <div>
          <label className="field-label">{t("checkout_second_phone")}</label>
          <input value={order.delivery.secondPhone || ""} onChange={(e) => updateDelivery("secondPhone", e.target.value)} onBlur={() => validatePhone(order.delivery.secondPhone, "secondPhone")} placeholder="01xxxxxxxxx" className={cls("secondPhone")} />
          <Err k="secondPhone" />
        </div>
      </div>
    </div>
  );
}
