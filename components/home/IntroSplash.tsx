"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const DURATION = 2800; // ms for the bar to fill
const FADE = 500;
const LINES = [
  { at: 4, text: "> establishing secure link" },
  { at: 34, text: "> decrypting style files" },
  { at: 72, text: "> access granted" },
];
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2; // easeInOutSine

/** Mobile-only boot screen shown once per visit, hands over to the landing screen when it finishes. */
export default function IntroSplash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("enc-intro") === "1"; } catch {}
    if (seen) { setPhase("gone"); return; }

    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let id = 0;
    let t2: ReturnType<typeof setTimeout>;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setPct(Math.round(ease(p) * 100));
      if (p < 1) { id = requestAnimationFrame(step); return; }
      try { sessionStorage.setItem("enc-intro", "1"); } catch {}
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("enc-intro-done"));
      setPhase("fade");
      t2 = setTimeout(() => setPhase("gone"), FADE);
    };
    id = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(id); clearTimeout(t2); document.documentElement.style.overflow = ""; };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] flex flex-col bg-ink md:hidden"
      style={{ opacity: phase === "fade" ? 0 : 1, transition: `opacity ${FADE}ms ease`, pointerEvents: phase === "fade" ? "none" : "auto" }}
    >
      <div className="cyber-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 50% 45%, rgba(0,242,58,.12), transparent 70%)" }} />

      <div className="relative flex flex-1 flex-col items-center justify-center px-8">
        <Logo size="lg" href={null} />
        <div className="mt-10 h-[72px] w-full max-w-[280px] font-[family-name:var(--font-terminal)] text-[17px] leading-6 tracking-wider text-[#00f23a]" style={{ textShadow: "0 0 10px #00f23a88" }}>
          {LINES.map((l) => (
            <p key={l.text} style={{ opacity: pct >= l.at ? 1 : 0, transform: pct >= l.at ? "none" : "translateY(6px)", transition: "opacity .3s, transform .3s" }}>{l.text}</p>
          ))}
        </div>
      </div>

      <div className="relative px-8 pb-14">
        <div className="mb-3 flex items-end justify-between font-[family-name:var(--font-terminal)] text-[#00f23a]">
          <span className="text-sm tracking-[.25em] opacity-80">LOADING</span>
          <span className="text-4xl leading-none" style={{ textShadow: "0 0 14px #00f23a88" }}>{String(pct).padStart(2, "0")}%</span>
        </div>
        <div className="h-[2px] w-full bg-[#00f23a]/15">
          <div className="h-full bg-[#00f23a]" style={{ width: `${pct}%`, boxShadow: "0 0 12px #00f23a, 0 0 24px #00f23a88" }} />
        </div>
      </div>
    </div>
  );
}
