"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import useCategories from "../usecategories";
import Logo from "./Logo";

const socials = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL,
};

function TikTok({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
}

export default function Footer() {
  const { categories = [] } = useCategories();
  const heading = "mb-4 text-xs font-semibold text-bone";
  const link = "text-[11px] text-bone/65 transition hover:text-[#00f23a]";
  const social = "text-bone transition hover:text-[#00f23a]";
  return (
    <footer className="mt-12 bg-ink text-bone">
      <div className="site-container pb-6 pt-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Logo size="md" href={null} />
            <p className="text-xs text-bone/80">Where Cairo streetwear meets cyber style.</p>
          </div>
          <div><h3 className={heading}>Shop Now</h3><ul className="space-y-3">
            <li><Link className={link} href="/products?sort=new">New Arrivals</Link></li>
            {categories.slice(0, 3).map(c => <li key={c.id}><Link className={`${link} capitalize`} href={`/products?category=${c.slug}`}>{c.name}</Link></li>)}
          </ul></div>
          <div><h3 className={heading}>Know us</h3><ul className="space-y-3">
            <li><Link className={link} href="/about">About Us</Link></li>
            <li><Link className={link} href="/about?tab=contact">Contact Us</Link></li>
          </ul></div>
          <div><h3 className={heading}>Help</h3><ul className="space-y-3">
            <li><Link className={link} href="/about?tab=shipping">Encrypted policy</Link></li>
            <li><Link className={link} href="/account">Track your order</Link></li>
            <li><Link className={link} href="/about?tab=faqs">FAQs</Link></li>
          </ul></div>
        </div>
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-bone/25 pt-5 text-[10px] text-bone/80">
          <span>Encrypted {new Date().getFullYear()}</span>
          <div className="flex items-center gap-5">
            {socials.facebook && <a className={social} href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>}
            {socials.instagram && <a className={social} href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>}
            {socials.tiktok && <a className={social} href={socials.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTok /></a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
