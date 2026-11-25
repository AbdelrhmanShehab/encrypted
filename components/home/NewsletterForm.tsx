"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error();
      setState("done");
      setEmail("");
    } catch { setState("error"); }
  };

  return (
    <div>
      <form onSubmit={submit} className="flex border border-white/30 bg-[#0a0a0a] focus-within:border-[#00f23a]" noValidate>
        <input type="email" required value={email} onChange={e => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }} placeholder="Give us your mail!" aria-label="Email address" className="min-w-0 flex-1 bg-transparent px-4 py-4 text-xs text-bone outline-none placeholder:text-white/40" />
        <button type="submit" disabled={state === "sending"} aria-label="Subscribe" className="grid w-14 place-items-center bg-[#4a4a4a] text-[#00f23a] transition hover:bg-[#5a5a5a] disabled:opacity-60"><Send size={20} fill="currentColor" /></button>
      </form>
      <p role="status" className={`mt-3 text-xs ${state === "error" ? "text-red-400" : "text-[#00f23a]"}`}>
        {state === "done" && "You're in. Watch your inbox for the next drop."}
        {state === "error" && "Couldn't subscribe. Check the email and try again."}
      </p>
    </div>
  );
}
