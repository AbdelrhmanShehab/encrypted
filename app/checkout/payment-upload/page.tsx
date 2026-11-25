"use client";

import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { useCheckout } from "../../../context/CheckoutContext";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, Copy, Check, ImageUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="page-shell text-bone">
            <Header />
            <section className="site-container flex flex-1 items-center justify-center py-10 md:py-16">
                <div className="w-full max-w-lg">{children}</div>
            </section>
            <Footer />
        </div>
    );
}

export default function PaymentUploadPage() {
    const { order, shippingFee, quote, quoteError, quoteLoading } = useCheckout();
    const { clearCart } = useCart();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/checkout/payment-upload&message=Please login to your account to complete your purchase.");
        }
    }, [loading, user, router]);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const checkoutReference = useRef('');
    useEffect(() => {
        const signature = JSON.stringify(order);
        try {
            const saved = JSON.parse(sessionStorage.getItem('checkout_request') || 'null');
            checkoutReference.current = saved?.signature === signature ? saved.key : crypto.randomUUID();
            sessionStorage.setItem('checkout_request', JSON.stringify({ signature, key: checkoutReference.current }));
        } catch { checkoutReference.current = crypto.randomUUID(); }
    }, [order]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const instapayNumber = process.env.NEXT_PUBLIC_INSTAPAY_NUMBER || "01023202564";
    const copyNumber = () => { navigator.clipboard?.writeText(instapayNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const subtotal = quote?.totals.subtotal ?? order.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );
    const shipping = shippingFee;
    const discount = quote?.totals.discount || 0;
    const total = quote?.totals.total ?? subtotal + shipping;

    const isCOD = order.payment === "cod";
    
    const calculateDeposit = (amount: number) => {
        if (amount < 500) return 150;
        if (amount < 1000) return 200;
        if (amount < 2000) return 250;
        if (amount < 4000) return 500;
        return Math.ceil(amount * 0.5);
    };

    const amountDue = quote?.payment.depositAmount ?? (isCOD ? calculateDeposit(Math.max(0, subtotal - discount)) : total);
    const remainingOnDelivery = isCOD ? total - amountDue : 0;

    useEffect(() => {
        if (order.items.length === 0 || !order.delivery.city) {
            router.push("/checkout");
        }
    }, [order.items.length, order.delivery.city, router]);

    const handleFile = (f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setError("");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith("image/")) handleFile(dropped);
    };

    const handleSubmit = async () => {
        if (!quote || quoteError || quoteLoading) { setError(quoteError || "Wait for checkout validation before paying."); return; }
        if (!file && amountDue > 0) {
            setError("Please attach your Instapay transaction screenshot to proceed.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            let photoUrl: string | null = null;
            if (file) {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.error || "Upload failed");
            }

            photoUrl = (await uploadRes.json()).url;
            }

            const orderItems = order.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                price: item.price,
                qty: item.qty,
                image: item.image,
                color: item.color,
                size: item.size,
            }));

            const response = await authenticatedFetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Idempotency-Key": checkoutReference.current },
                body: JSON.stringify({
                    couponCode: order.couponCode || "",
                    quotedTotal: quote.totals.total,
                    quotedDeposit: quote.payment.depositAmount,
                    userId: user?.uid ?? null,
                    items: orderItems,
                    contact: {
                        email: order.contact.email,
                        phone: order.delivery.phone,
                    },
                    delivery: order.delivery,
                    payment: {
                        method: order.payment,
                        depositType: isCOD ? "deposit" : "full",
                        depositAmount: amountDue,
                        paymentPhotoUrl: photoUrl,
                        paid: false,
                    },
                    totals: {
                        subtotal,
                        shipping,
                        total,
                    },
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
                setUploading(false);
                return;
            }

            sessionStorage.removeItem("checkout_request");
            clearCart();
            router.push(`/confirmation/${data.orderId}`);
        } catch (err: unknown) {
            setError("Submission failed: " + (err instanceof Error ? err.message : "Please try again."));
            setUploading(false);
        }
    };

    const card = "rounded-2xl border border-bone/10 bg-[#0a0c0a] p-6 md:p-8 space-y-6";

    if (!quote || quoteError || quoteLoading) return <Shell>
        <div className={card}>
            <p role={quoteError ? 'alert' : 'status'} className={quoteError ? 'text-red-400' : 'text-bone/70'}>{quoteError || 'Validating your checkout and payment amount...'}</p>
            <button onClick={() => router.push('/checkout')} className="btn-outline">Back to checkout</button>
        </div>
    </Shell>;

    if (amountDue === 0) return <Shell>
        <div className={card}>
            <h1 className="page-title">Confirm your order</h1>
            <p className="text-sm text-bone/70">No payment is due now. Order total: <span className="text-[#00f23a]">EGP {total.toLocaleString()}</span>.</p>
            {discount > 0 && <p className="text-sm text-bone/70">Promo {order.couponCode}: - EGP {discount.toLocaleString()}</p>}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
                <button onClick={() => router.push('/checkout')} className="btn-outline">Back</button>
                <button disabled={uploading} onClick={handleSubmit} className="btn-green flex-1 !py-3 !text-sm disabled:opacity-50">{uploading ? 'Submitting...' : 'Confirm order'}</button>
            </div>
        </div>
    </Shell>;

    const stepCls = "flex gap-4";
    const num = "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#00f23a]/15 text-xs font-semibold text-[#00f23a]";

    return (
        <Shell>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-bone/45">
                <span>Delivery details</span>
                <span>›</span>
                <span className="font-semibold text-bone">Payment</span>
                <span>›</span>
                <span>Done</span>
            </div>

            <div className={card}>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-bone">{isCOD ? "Confirm your order" : "Complete your payment"}</h1>
                    <p className="text-sm leading-relaxed text-bone/65">
                        {isCOD
                            ? "Send a small deposit with Instapay to reserve your order. You pay the rest in cash when it arrives."
                            : "Pay for your order with Instapay. It only takes a minute, and we confirm it as soon as we see your screenshot."}
                    </p>
                </div>

                <div className="rounded-xl bg-ink p-5">
                    <p className="text-xs text-bone/55">{isCOD ? "Deposit to send now" : "Amount to send"}</p>
                    <p className="mt-1 text-3xl font-semibold text-bone">EGP {amountDue.toLocaleString()}</p>
                    <div className="mt-4 space-y-1.5 border-t border-bone/10 pt-4 text-sm text-bone/60">
                        <div className="flex justify-between"><span>Order subtotal</span><span>EGP {subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>EGP {shipping}</span></div>
                        {discount > 0 && <div className="flex justify-between"><span>Promo {order.couponCode}</span><span>- EGP {discount.toLocaleString()}</span></div>}
                        {isCOD && <div className="flex justify-between pt-1 text-bone"><span>Pay on delivery</span><span>EGP {remainingOnDelivery.toLocaleString()}</span></div>}
                    </div>
                </div>

                <ol className="space-y-5">
                    <li className={stepCls}>
                        <span className={num}>1</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-bone">Send the amount with Instapay</p>
                            <p className="mt-1 text-xs text-bone/55">Open your banking app or Instapay and transfer to this number (Instapay or Vodafone Cash).</p>
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-bone/10 bg-ink px-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-xs text-bone/50">Encrypted</p>
                                    <p className="font-mono text-lg tracking-wide text-bone">{instapayNumber}</p>
                                </div>
                                <button type="button" onClick={copyNumber} className="flex shrink-0 items-center gap-1.5 rounded-md border border-bone/15 px-3 py-2 text-xs font-medium text-bone transition hover:border-[#00f23a] hover:text-[#00f23a]">
                                    {copied ? <Check size={14} className="text-[#00f23a]" /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </li>
                    <li className={stepCls}>
                        <span className={num}>2</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-bone">Take a screenshot of the receipt</p>
                            <p className="mt-1 text-xs text-bone/55">Keep the transfer confirmation screen showing the amount.</p>
                        </div>
                    </li>
                    <li className={stepCls}>
                        <span className={num}>3</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-bone">Upload it here and confirm</p>
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`mt-3 flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition ${preview ? "border-[#00f23a]/60 p-3" : "border-bone/20 p-6 hover:border-[#00f23a]/60"}`}
                            >
                                {preview ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="Payment receipt preview" className="mx-auto max-h-52 w-full rounded-lg object-contain" loading="lazy" onError={(e) => { e.currentTarget.srcset = ""; e.currentTarget.src = "/1.png"; }} />
                                        <p className="flex items-center gap-1.5 text-xs text-[#00f23a]"><Check size={14} /> Screenshot added. Tap to change it.</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageUp className="text-bone/50" size={26} />
                                        <p className="text-sm text-bone">Tap to choose your screenshot</p>
                                        <p className="text-xs text-bone/45">PNG, JPG or WEBP</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                            </div>
                        </div>
                    </li>
                </ol>

                {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

                <div className="flex gap-3">
                    <button onClick={() => router.push("/checkout")} className="btn-outline flex-none !px-5 !py-3 !text-sm">Back</button>
                    <button onClick={handleSubmit} disabled={uploading || !file || !quote || !!quoteError || quoteLoading} suppressHydrationWarning className="btn-green flex-1 !py-3 !text-sm disabled:cursor-not-allowed disabled:opacity-40">
                        {uploading ? "Sending your order…" : "Confirm my order"}
                    </button>
                </div>
                {!file && <p className="text-center text-xs text-bone/45">Add your screenshot above to continue.</p>}

                <div className="space-y-2 border-t border-bone/10 pt-5 text-xs text-bone/55">
                    <p className="flex items-center gap-2"><Lock size={14} className="shrink-0 text-[#00f23a]" /> We never ask for card details. Instapay only.</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={14} className="shrink-0 text-[#00f23a]" /> Your order is reserved once we receive your screenshot, and we confirm it by email.</p>
                    <p className="pl-6">Need help? <Link href="/about?tab=contact" className="text-[#00f23a] underline underline-offset-4">Contact us</Link></p>
                </div>
            </div>
        </Shell>
    );
}
