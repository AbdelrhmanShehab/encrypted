"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider, browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword,
  sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signInWithPopup, updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const friendly: Record<string, string> = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "No account with this email.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/email-already-in-use": "This email already has an account. Try logging in.",
  "auth/weak-password": "Choose a stronger password (6+ characters).",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/operation-not-allowed": "Email sign-in isn't enabled yet. Use Google for now.",
  "auth/network-request-failed": "Network problem. Check your connection.",
};

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/";
  const notice = params.get("message");
  const signup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const fail = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    if (code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") return;
    setError(friendly[code] ?? "Something went wrong. Please try again.");
  };

  const google = async () => {
    setError(""); setInfo("");
    try { await setPersistence(auth, keep ? browserLocalPersistence : browserSessionPersistence); await signInWithPopup(auth, new GoogleAuthProvider()); router.push(redirectTo); }
    catch (e) { fail(e); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    if (signup && !name.trim()) { setError("Enter your name."); return; }
    setBusy(true);
    try {
      await setPersistence(auth, keep ? browserLocalPersistence : browserSessionPersistence);
      if (signup) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.push(redirectTo);
    } catch (err) { fail(err); }
    finally { setBusy(false); }
  };

  const forgot = async () => {
    setError(""); setInfo("");
    if (!email.trim()) { setError("Type your email first, then press Forgot password."); return; }
    try { await sendPasswordResetEmail(auth, email.trim()); setInfo("Password reset email sent. Check your inbox."); } catch (err) { fail(err); }
  };

  const switchHref = `${signup ? "/login" : "/signup"}${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <div className="page-shell">
      <Header />
      <main className="flex-1">
        <div className="site-container grid gap-10 py-8 md:grid-cols-2 md:gap-16 md:py-12">
          {/* Brand panel */}
          <div className="relative hidden aspect-[4/3.4] overflow-hidden md:block">
            <p className="absolute left-0 top-0 z-10 text-4xl font-medium text-[#00f23a] lg:text-5xl">Shop Smart</p>
            <p className="absolute left-[30%] top-[16%] z-10 text-3xl font-medium text-[#00f23a] lg:text-4xl">Shop Local .</p>
            <Image src="/encrypted-mask-hero.png" alt="" fill sizes="40vw" className="object-contain opacity-70 grayscale" style={{ objectPosition: "50% 55%" }} />
            <p className="absolute inset-x-0 bottom-2 z-10 text-center text-4xl font-extrabold tracking-[.4em] text-bone lg:text-5xl">Encrypted</p>
          </div>

          {/* Form */}
          <div className="mx-auto w-full max-w-md md:mx-0 md:pt-4">
            <h1 className="text-3xl font-medium text-[#00f23a]">{signup ? "Create Account" : "Login"}</h1>
            <p className="mt-2 text-[10px] text-white/55">Enter your credentials to {signup ? "create your account" : "log in"}</p>
            {notice && <p className="mt-4 border border-[#00f23a]/40 px-3 py-2 text-xs text-[#00f23a]">{notice}</p>}

            <button type="button" onClick={google} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-[#141414] py-3 text-[11px] font-semibold text-[#00f23a] transition hover:border-[#00f23a]/60">
              <span className="text-sm font-bold" aria-hidden>G</span>
              {signup ? "Create account with google" : "Log in with google"}
            </button>
            <div className="my-5 flex items-center gap-3 text-[10px] text-white/50"><span className="h-px flex-1 bg-white/25" />or<span className="h-px flex-1 bg-white/25" /></div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {signup && (
                <div><label className="field-label" htmlFor="name">Your Name</label><input id="name" className="field" placeholder="Abdelrhman" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
              )}
              <div><label className="field-label" htmlFor="email">Email Address</label><input id="email" type="email" className="field" placeholder="example@gmail.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div>
                <div className="flex items-end justify-between"><label className="field-label" htmlFor="password">Password</label>{!signup && <button type="button" onClick={forgot} className="mb-1.5 text-[10px] font-semibold text-[#00f23a]">Forgot password?</button>}</div>
                <input id="password" type="password" className="field" placeholder={signup ? "Choose a strong password" : "Enter your password"} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[10px] text-white/70">
                <input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} className="h-3.5 w-3.5 accent-[#00f23a]" /> Keep me signed in
              </label>
              {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
              {info && <p role="status" className="text-xs text-[#00f23a]">{info}</p>}
              <button type="submit" disabled={busy} className="btn-green w-full py-3.5">{busy ? "Please wait…" : signup ? "Create Account" : "Login"}</button>
            </form>

            <p className="mt-4 text-[10px] text-white/70">
              {signup ? "Already a member? " : "Don't have an account? "}
              <Link href={switchHref} className="font-semibold text-[#00f23a]">{signup ? "Login" : "Create one"}</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
