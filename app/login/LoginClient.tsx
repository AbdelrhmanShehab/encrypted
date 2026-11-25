"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginClient() {
  return (
    <Suspense fallback={<div className="page-shell grid place-items-center"><p className="animate-pulse text-white/50">Loading...</p></div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
