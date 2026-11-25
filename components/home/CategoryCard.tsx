"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  image: string;
  href: string;
};

const CategoryCard = React.memo(({ title, image, href }: Props) => {
  // 🛡️ Data Guard: Handle missing/invalid title
  if (!title || typeof title !== "string") return null;

  // Extract just the category name from "Shop CategoryName" if needed
  const displayName = title.replace("Shop ", "");

  return (
    <Link
      href={href}
      className="group block w-full flex-shrink-0"
    >
      <div className="relative aspect-[4/5] w-full min-w-[100px] overflow-hidden border border-white/10 bg-zinc-100 transition-all duration-300 group-hover:border-[#00f03a]/70">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent"/>
        <span className="absolute left-3 top-3 border border-[#00f03a]/60 bg-black/75 px-2 py-1 font-mono text-[8px] text-[#00f03a]">CATEGORY SIGNAL</span>
        <span className="absolute bottom-3 left-3 right-3 text-left font-mono text-xs font-semibold uppercase tracking-wider text-white">{displayName}</span>
      </div>
    </Link>
  );
});

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
