"use client";

import { useEffect, useState } from "react";

/** Types the given lines one character at a time on load, like a terminal session. */
export default function TypeWriter({ lines, speed = 70, startDelay = 500 }: { lines: string[]; speed?: number; startDelay?: number }) {
  const full = lines.join("\n");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(full.length); return; }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < full.length) timer = setTimeout(tick, speed + Math.random() * 60 - (full[i] === " " ? 20 : 0));
    };
    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, [full, speed, startDelay]);

  const typed = full.slice(0, count).split("\n");
  return (
    <span aria-label={lines.join(" ")} role="text" className="relative block">
      {/* invisible full copy reserves the final size so the layout never jumps */}
      <span aria-hidden className="invisible block whitespace-pre">{full}_</span>
      <span aria-hidden className="absolute left-0 top-0 block whitespace-pre">
        {typed.map((line, i) => (
          <span key={i} className="block">
            {line}
            {i === typed.length - 1 && <span className="hero-cursor">_</span>}
            {i !== typed.length - 1 && "​"}
          </span>
        ))}
      </span>
    </span>
  );
}
