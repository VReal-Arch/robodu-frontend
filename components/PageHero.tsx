"use client";

import { usePathname } from "next/navigation";
import { TITLES } from "@/lib/nav";

/** Large banner at the top of every page (title + eyebrow). Visual only. */
export default function PageHero() {
  const pathname = usePathname();
  const [title, sub] = TITLES[pathname] ?? ["Robo-du", ""];

  return (
    <section className="hero">
      <div className="hero-inner">
        {sub && <div className="eyebrow hero-eyebrow">{sub}</div>}
        <h1 className="hero-title">{title}</h1>
      </div>
    </section>
  );
}
