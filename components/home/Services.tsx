import Image from "next/image";

const services = [
  { lead: "Exclusive Collections;", text: "Shop unique and exclusive fashion designed in-house by Encrypted, all in one place." },
  { lead: "Custom Modeling;", text: "Choose a model that matches your body type to see how clothes fit before you buy." },
  { lead: "Personalized Recommendations;", text: "Get tailored style suggestions based on your preferences and our latest drops." },
];

export default function Services() {
  return (
    <section id="services" className="site-container relative overflow-hidden py-16 md:py-28" aria-label="Our services">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
        <h2 className="text-5xl font-bold leading-none md:hidden">Our Services</h2>
        <ul className="order-2 space-y-8 text-xs leading-6 text-bone/85 md:order-1 md:max-w-xs md:space-y-12">
          {services.map(s => (
            <li key={s.lead}>
              <b className="font-semibold text-[#00f23a]">{s.lead}</b>{" "}
              {s.text}
            </li>
          ))}
        </ul>
        <div className="relative order-1 mx-auto w-full max-w-[520px] md:order-2 md:max-w-none">
          <h2 className="pointer-events-none absolute -top-2 right-0 z-0 hidden text-6xl font-bold leading-none md:block lg:text-7xl">Our Services</h2>
          <div className="relative mx-auto mt-0 aspect-square w-[88%] md:mt-16 md:w-[80%]">
            <div className="absolute inset-0 rounded-full bg-[#00f23a] shadow-[0_0_120px_rgba(0,242,58,.35)]" />
            <Image src="/services-cutout.png" alt="Encrypted menswear model" width={946} height={1335} sizes="(max-width: 768px) 70vw, 32vw" className="absolute bottom-[-6%] left-1/2 z-10 h-[118%] w-auto max-w-none -translate-x-1/2" priority={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
