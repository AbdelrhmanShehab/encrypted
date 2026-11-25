"use client";

import Link from "next/link";
import { User, ShoppingBag, Menu, X, Heart, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useCategories from "../usecategories";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";

export default function Header() {
  const { categories } = useCategories();
  const { items, openCart } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const count = items.reduce((sum,item)=>sum+item.qty,0);
  const search = () => { if(query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`); setQuery(""); setMenuOpen(false); };
  const icon = "relative grid h-10 w-10 place-items-center rounded-full text-[#00f03a] transition hover:bg-[#00f03a]/10";
  const links = [{href:"/",label:"Home"},{href:"/products",label:"All Clothing"},{href:"/about",label:"Our Story"}];

  return <header className="sticky top-0 z-40 border-b border-bone/[.08] bg-ink/95 text-bone backdrop-blur-xl">
    <div className="site-container flex items-center justify-between gap-2 py-2.5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:py-3">
      <div className="flex items-center gap-3"><button className="grid h-10 w-9 place-items-center text-[#00f03a] lg:hidden" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?"Close menu":"Open menu"}>{menuOpen?<X/>:<Menu/>}</button><Link href="/" aria-label="Encrypted home" className="shrink-0"><Logo size="sm"/></Link></div>
      <nav className="hidden items-center gap-1 rounded-xl border border-bone/10 bg-ink p-1.5 lg:flex">
        {links.map((item,i)=><Link key={item.href} href={item.href} className={`rounded-lg px-4 py-3 text-[11px] font-semibold transition ${i===0?"bg-[#202220] text-bone":"text-bone/75 hover:text-[#00f03a]"}`}>{item.label}</Link>)}
        <div className="group relative"><button className="flex items-center gap-1 rounded-lg px-4 py-3 text-[11px] font-semibold text-bone/75 transition hover:text-[#00f03a]">Shop for <ChevronDown size={13} className="text-[#00f03a]"/></button><div className="invisible absolute left-0 top-full z-50 mt-2 min-w-48 translate-y-1 border border-[#00f03a]/30 bg-[#080a08] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">{categories.slice(0,8).map(cat=><Link key={cat.id} href={`/products?category=${cat.slug}`} className="block px-3 py-2 text-xs capitalize text-bone/70 hover:bg-[#00f03a]/10 hover:text-[#00f03a]">{cat.name}</Link>)}</div></div>
      </nav>
      <div className="flex items-center justify-end gap-1 md:gap-2">
        <button onClick={()=>{window.location.href=user?"/favorites":"/login-required?redirect=/favorites";}} className={icon} aria-label="Favorites"><Heart size={19}/></button>
        <button onClick={()=>{window.location.href=user?"/account":"/login?redirect=/account";}} className={`${icon} hidden sm:grid`} aria-label="Account"><User size={19}/></button>
        <button onClick={openCart} className={`${icon} active:scale-95`} aria-label="Shopping bag"><ShoppingBag size={19}/>{count>0&&<span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#00f03a] px-1 text-[9px] font-bold text-ink">{count}</span>}</button>
      </div>
    </div>
    {menuOpen&&<div className="absolute inset-x-0 top-full border-b border-[#00f03a]/30 bg-ink p-5 shadow-2xl lg:hidden"><form onSubmit={e=>{e.preventDefault();search();}} className="relative mb-4"><input aria-label="Search clothing" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clothing..." className="w-full border border-bone/15 bg-[#090b09] py-3 pl-10 pr-3 text-sm text-bone outline-none placeholder:text-bone/35 focus:border-[#00f03a]"/><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00f03a]"/></form>{[...links,...categories.slice(0,8).map(c=>({href:`/products?category=${c.slug}`,label:c.name}))].map(item=><Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)} className="block border-b border-bone/[.08] py-3 text-sm capitalize text-bone/75 hover:text-[#00f03a]">{item.label}</Link>)}</div>}
  </header>;
}
