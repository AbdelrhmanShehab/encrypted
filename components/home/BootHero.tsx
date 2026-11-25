"use client";

import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const LINES = ["INITIALIZING ENCRYPTED...", "ESTABLISHING CONNECTION...", "ACCESSING COLLECTION..."];
type Stage = "cursor" | "typing" | "scan" | "title";

// Plays on every fresh load / refresh; only skipped when you navigate back to the home page without reloading.
let bootPlayed = false;
const HOLD = 3000; // ms the finished boot design stays on screen
const GLITCH = 750; // ms of the glitch-out before the page appears
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

/** Falling 0/1 + hex code on a canvas. Throttled, pauses off-screen / in background tabs, and fully stops when `active` ends. */
const HexRain = memo(function HexRain({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const parent = cv?.parentElement;
    if (!active || !cv || !parent || reducedMotion()) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;
    const fs = 16;
    const chars = "0101010101" + "0123456789ABCDEF";
    let w = 0, h = 0, drops: number[] = [], speeds: number[] = [];
    const init = () => {
      const r = parent.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / fs);
      drops = Array.from({ length: cols }, () => -Math.random() * (h / fs));
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.6);
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    };
    init();
    let rt: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(init, 200); });
    ro.observe(parent);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    let raf = 0, last = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden || t - last < 50) return; // ~20fps is plenty for falling code
      last = t;
      ctx.fillStyle = "rgba(0,0,0,.16)"; ctx.fillRect(0, 0, w, h);
      ctx.font = `${fs}px ui-monospace, Menlo, Consolas, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * fs;
        if (y > 0) {
          ctx.fillStyle = Math.random() < 0.05 ? "#d6ffe0" : "#00f23a";
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * fs, y);
        }
        drops[i] += speeds[i];
        if (y > h && Math.random() > 0.97) drops[i] = -Math.random() * 20;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); clearTimeout(rt); ro.disconnect(); io.disconnect(); };
  }, [active]);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full transition-opacity duration-1000" style={{ opacity: active ? 0.55 : 0 }} />;
});

/** Types `text` once `active`; reserves its final width so nothing shifts. */
function Typed({ text, active, speed = 35, instant, onDone }: { text: string; active: boolean; speed?: number; instant?: boolean; onDone?: () => void }) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) { setN(text.length); return; }
    if (!active || n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), speed + Math.random() * 15);
    return () => clearTimeout(t);
  }, [active, n, text, speed, instant]);
  useEffect(() => {
    if (active && !instant && n >= text.length) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, active]);
  return <>{text.slice(0, n)}<span className="invisible">{text.slice(n)}</span></>;
}

/**
 * Mobile boot: black + cursor → typed boot lines with code rain → scan line → typed title block → hold →
 * glitch-out → the page (compact title block + `children`) appears. Desktop skips all of it.
 */
export default function BootHero({ children }: { children?: ReactNode }) {
  const [stage, setStage] = useState<Stage>("cursor");
  const [typed, setTyped] = useState<string[]>([""]);
  const [rain, setRain] = useState(false);
  const [step, setStep] = useState(0);
  const [skip, setSkip] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [fast, setFast] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (isDesktop() || bootPlayed || reducedMotion()) { setSkip(true); setTyped(LINES); setStage("title"); setStep(5); setCollapsed(true); return; }

    document.documentElement.style.overflow = "hidden"; // no scrolling while the boot plays
    const timers = timersRef.current;
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    let li = 0, ci = 0;
    const tick = () => {
      const l = li;
      ci += 1;
      const text = LINES[l].slice(0, ci);
      setTyped((prev) => { const n = [...prev]; n[l] = text; return n; });
      if (ci < LINES[l].length) { at(28 + Math.random() * 22, tick); return; }
      if (l + 1 < LINES.length) {
        li += 1; ci = 0;
        setTyped((prev) => [...prev, ""]);
        if (li === 1) setRain(true);
        at(260, tick);
      } else {
        at(350, () => { setStage("scan"); at(1000, () => setStage("title")); });
      }
    };
    at(1500, () => { setStage("typing"); tick(); });
    return () => { timers.forEach(clearTimeout); document.documentElement.style.overflow = ""; };
  }, []);

  // title block fully typed → hold → glitch out → reveal the page
  useEffect(() => {
    if (step !== 5 || collapsed || leaving) return;
    bootPlayed = true;
    const t1 = setTimeout(() => setGlitching(true), HOLD);
    const t2 = setTimeout(() => {
      setRain(false); setGlitching(false); setCollapsed(true);
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
    }, HOLD + GLITCH);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, collapsed, leaving]);

  // SKIP: jump to the finished design, then glitch straight out to the page
  const skipNow = (scrollDown = false) => {
    if (leaving || collapsed) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    bootPlayed = true;
    setLeaving(true); setFast(true);
    setTyped(LINES); setStage("title"); setStep(5); setRain(true);
    setGlitching(true);
    setTimeout(() => {
      setRain(false); setGlitching(false); setCollapsed(true);
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
      if (scrollDown) setTimeout(() => document.getElementById("home-start")?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
    }, GLITCH);
  };

  const last = typed.length - 1;
  const title = "ENCRYPTED";
  return (
    <>
      <section className={`relative flex flex-col overflow-hidden bg-ink md:hidden ${glitching ? "boot-out" : ""}`} style={{ minHeight: collapsed ? 0 : "calc(100svh - 57px)" }}>
        {!collapsed && <HexRain active={rain} />}
        {!collapsed && <div className="absolute inset-0" style={{ background: "radial-gradient(60% 26% at 50% 52%, rgba(0,0,0,.8), transparent 75%)" }} />}
        {stage === "scan" && <div className="boot-scan" />}
        {glitching && <div aria-hidden className="boot-flash" />}

        {!collapsed && (
          <div className="relative z-10 px-5 pt-7 font-[family-name:var(--font-terminal)] text-[19px] leading-[1.5] tracking-[.08em] text-[#00f23a]" style={{ textShadow: "0 0 8px #00f23a88", opacity: stage === "title" ? 0.55 : 1, transition: "opacity .6s" }}>
            {typed.map((line, i) => (
              <p key={i}>{line}{i === last && <span className="hero-cursor">█</span>}</p>
            ))}
          </div>
        )}

        {stage === "title" && (
          <div className="relative z-10 flex flex-1 flex-col justify-center px-5 font-[family-name:var(--font-terminal)]" style={{ paddingTop: collapsed ? 28 : 0, paddingBottom: collapsed ? 24 : 48 }}>
            <p className="text-[17px] tracking-[.18em] text-[#00f23a]" style={{ textShadow: "0 0 8px #00f23a88" }}>
              <Typed text="SYSTEM STATUS: ONLINE" active instant={skip || fast} speed={32} onDone={() => setStep((s) => Math.max(s, 1))} />
            </p>
            <h1 className={`boot-glitch mt-3 text-[clamp(44px,14.6vw,84px)] ${step >= 2 ? "is-in" : ""}`} data-text={title}>
              <Typed text={title} active={step >= 1} instant={skip || fast} speed={85} onDone={() => setStep((s) => Math.max(s, 2))} />
            </h1>
            <p className="mt-4 font-[family-name:var(--font-display)] text-[clamp(20px,6vw,28px)] font-extrabold uppercase tracking-tight text-bone">
              <Typed text="Style decrypted." active={step >= 2} instant={skip || fast} speed={45} onDone={() => setStep((s) => Math.max(s, 3))} />
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className={`h-px flex-1 bg-[#00f23a] ${step >= 3 ? "boot-grow" : "opacity-0"}`} style={{ boxShadow: "0 0 8px #00f23a" }} />
              <span className="text-[15px] tracking-[.14em] text-[#00f23a]">
                <Typed text="ACCESS GRANTED" active={step >= 3} instant={skip || fast} speed={40} onDone={() => setStep((s) => Math.max(s, 4))} />
              </span>
            </div>
            <p className="mt-3 text-[15px] uppercase tracking-[.14em] text-bone/55">
              <Typed text="Your next identity starts here." active={step >= 4} instant={skip || fast} speed={28} onDone={() => setStep((s) => Math.max(s, 5))} />
            </p>
          </div>
        )}
        {stage === "title" && !collapsed && !leaving && (
          <button type="button" onClick={() => skipNow(true)} aria-label="Scroll to the store" className="boot-bounce absolute bottom-3 left-1/2 z-40 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border border-[#00f23a]/50 bg-ink/60 text-[#00f23a] shadow-[0_0_18px_rgba(0,242,58,.35)] transition active:scale-95">
            <ChevronDown aria-hidden size={36} strokeWidth={2.5} />
          </button>
        )}
        {!collapsed && !leaving && (
          <button type="button" onClick={() => skipNow()} aria-label="Skip intro" style={{ animationDelay: ".5s", textShadow: "0 0 10px rgba(0,242,58,.7)" }} className="boot-in absolute bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-md border border-[#00f23a] bg-[#00f23a]/15 px-5 py-3 font-[family-name:var(--font-terminal)] text-[22px] leading-none tracking-[.2em] text-[#00f23a] shadow-[0_0_18px_rgba(0,242,58,.35)] transition active:scale-95 hover:bg-[#00f23a]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00f23a]">
            SKIP <span aria-hidden>»</span>
          </button>
        )}
      </section>
      {collapsed && <div id="home-start" className={skip ? "" : "boot-reveal"}>{children}</div>}
    </>
  );
}
