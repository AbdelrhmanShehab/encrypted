import Link from "next/link";

const words = ["Cairo Born", "Own Design", "Streetwear", "Everyday", "New Drops", "Decoded"];

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((word, i) => (
        <li key={word} className="flex items-center">
          <span
            className={`px-6 text-5xl font-extrabold uppercase leading-none tracking-tight md:px-10 md:text-7xl ${i % 2 ? "text-bone" : "text-transparent"}`}
            style={i % 2 ? undefined : { WebkitTextStroke: "1.5px #00f23a" }}
          >
            {word}
          </span>
          <span className="text-2xl text-[#00f23a] md:text-4xl" aria-hidden>✦</span>
        </li>
      ))}
    </ul>
  );
}

export default function BrandSignal() {
  return (
    <section id="code" className="py-12 md:py-16" aria-label="The Encrypted code">
      <div className="site-container mb-6 flex items-center justify-between">
        <h2 className="section-title">The Encrypted Code</h2>
        <Link href="/products" className="border-b border-[#00f23a] text-xs text-[#00f23a] transition hover:text-bone">See all</Link>
      </div>
      <div className="group overflow-hidden border-y border-[#00f23a]/40 py-6 md:py-8">
        <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
          <Track />
          <Track hidden />
        </div>
      </div>
    </section>
  );
}
