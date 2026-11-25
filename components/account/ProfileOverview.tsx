"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfileOverview() {
    const { t } = useLanguage();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        secondPhone: "",
        address: "",
        apartment: "",
        city: "",
    });
    const [citiesData, setCitiesData] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // ✅ Load data via API route (REST API)
                    const res = await fetch(`/api/user-data?uid=${currentUser.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            setFormData(prev => ({ 
                                ...prev, 
                                ...data,
                                // Ensure city is at least an empty string
                                city: data.city || "" 
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setLoadingCities(true);
                // ✅ Fetch cities via API route
                const res = await fetch("/api/cities");
                if (res.ok) {
                    const cities = await res.json();
                    setCitiesData(cities.map((c: any) => c.id));
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [editing, setEditing] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

    const handleSave = async () => {
        if (!user) return;
        setMsg(null);

        const regex = /^01[0-9]{9}$/;
        if (!regex.test(formData.phone) || !regex.test(formData.secondPhone)) {
            setMsg({ ok: false, text: t("checkout_invalid_phone") || "Invalid Egyptian phone number" });
            return;
        }
        if (!formData.city) {
            setMsg({ ok: false, text: t("error_city_required") || "City is required" });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, ...formData }),
            });
            if (!res.ok) throw new Error("Failed to save");
            setMsg({ ok: true, text: t("profile_saved") });
            setEditing(false);
        } catch (error) {
            console.error("Error saving user data:", error);
            setMsg({ ok: false, text: t("profile_save_failed") });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#00f23a]" /></div>;

    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || user?.displayName || "—";
    const hasAddress = !!(formData.address || formData.city);
    const Item = ({ label, value }: { label: string; value?: string }) => (
        <div>
            <p className="text-xs font-semibold text-bone/50">{label}</p>
            <p className="mt-2 break-words text-sm text-bone">{value || "—"}</p>
        </div>
    );
    const Field = ({ label, name, type = "text", placeholder }: { label: string; name: keyof typeof formData; type?: string; placeholder?: string }) => (
        // plain function (called, not rendered as a component) so inputs keep focus while typing
        <div>
            <label className="field-label">{label}</label>
            <input type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} className="field" />
        </div>
    );

    return (
        <div>
            {/* Subscribe card */}
            <div className="flex flex-col gap-4 rounded-xl bg-[#202020] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                    <p className="text-sm font-semibold text-bone">Subscribe with us</p>
                    <p className="mt-1 text-xs text-bone/55">By doing that we&apos;ll reach you with our latest offers</p>
                </div>
                <Link href="/about?tab=contact" className="btn-green !px-6 !py-3 !text-sm">Subscribe now</Link>
            </div>

            {msg && <p role="status" className={`mt-5 text-sm ${msg.ok ? "text-[#00f23a]" : "text-red-400"}`}>{msg.text}</p>}

            {/* Personal information */}
            <div className="mt-10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-bone">Personal Information</h3>
                {!editing && <button onClick={() => { setMsg(null); setEditing(true); }} className="flex items-center gap-1.5 text-xs font-medium text-[#00f23a]"><Pencil size={14} /> Edit</button>}
            </div>

            {editing ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {Field({ label: t("profile_first_name"), name: "firstName", placeholder: "First name" })}
                    {Field({ label: t("profile_last_name"), name: "lastName", placeholder: "Last name" })}
                    {Field({ label: t("profile_phone"), name: "phone", type: "tel", placeholder: "01xxxxxxxxx" })}
                    {Field({ label: t("profile_second_phone"), name: "secondPhone", type: "tel", placeholder: "01xxxxxxxxx" })}
                    <div className="sm:col-span-2">{Field({ label: t("profile_address"), name: "address", placeholder: "Street, building" })}</div>
                    {Field({ label: t("profile_apartment"), name: "apartment", placeholder: "Apt / area" })}
                    <div>
                        <label className="field-label">{t("profile_city")}</label>
                        <select name="city" value={formData.city} onChange={handleChange} className="field cursor-pointer">
                            <option value="">{loadingCities ? t("profile_loading_cities") || "Loading cities..." : t("profile_select_city")}</option>
                            {citiesData.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 sm:col-span-2">
                        <button onClick={handleSave} disabled={saving} suppressHydrationWarning className="btn-green !px-8 !py-3 !text-sm disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={16} /> : null}{t("profile_save")}
                        </button>
                        <button onClick={() => { setEditing(false); setMsg(null); }} className="btn-outline !px-6 !py-3 !text-sm">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="mt-6 grid gap-x-10 gap-y-9 sm:grid-cols-2">
                    <Item label="Name" value={fullName} />
                    <Item label="Email Address" value={user?.email || ""} />
                    <Item label="Phone number" value={formData.phone} />
                    <Item label="Second phone" value={formData.secondPhone} />
                </div>
            )}

            {/* Address */}
            <div className="mt-14 flex items-center justify-between">
                <h3 className="text-lg font-bold text-bone">Address</h3>
                {!editing && <button onClick={() => { setMsg(null); setEditing(true); }} className="flex items-center gap-1.5 text-xs font-medium text-[#00f23a]">{hasAddress ? <Pencil size={14} /> : <Plus size={14} />} {hasAddress ? "Edit" : "Add"}</button>}
            </div>
            {!editing && (hasAddress ? (
                <p className="mt-4 text-sm leading-relaxed text-bone/80">
                    {formData.address}{formData.apartment ? `, ${formData.apartment}` : ""}<br />{formData.city}
                </p>
            ) : (
                <p className="mt-4 text-xs text-bone/55">You didn&apos;t add address yet</p>
            ))}
        </div>
    );
}
