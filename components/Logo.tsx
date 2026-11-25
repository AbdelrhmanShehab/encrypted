import Image from "next/image";
import Link from "next/link";

type Props = { size?: "sm" | "md" | "lg"; href?: string | null; className?: string };

const widths = { sm: 132, md: 178, lg: 220 };

/** Encrypted marketplace wordmark supplied by the brand. */
export default function Logo({ size = "md", href = "/", className = "" }: Props) {
  const mark = <Image src="/encrypted-wordmark.png" alt="Encrypted" width={widths[size]} height={54} priority style={{ width: widths[size] }} className={`h-auto max-w-full ${className}`} />;
  return href ? <Link href={href} aria-label="Encrypted home" className="inline-flex">{mark}</Link> : mark;
}
