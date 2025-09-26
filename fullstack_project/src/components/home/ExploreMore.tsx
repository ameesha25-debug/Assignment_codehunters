// src/components/ExploreMore.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchHeroCategories, type CategoryHero } from "@/lib/api"; // from your api.ts

const TARGET_SLUGS = ["men", "women", "kids"] as const;

export default function ExploreMore() {
  const [heroes, setHeroes] = useState<CategoryHero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchHeroCategories(TARGET_SLUGS as unknown as string[])
      .then((d) => { if (alive) setHeroes(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const bySlug = new Map(heroes.map((c) => [c.slug, c]));

  const cards = [
    {
      title: "SHOP MEN",
      slug: "men",
      img: bySlug.get("men")?.image_url || "/images/explore/men.png",
      to: "/category/men",
    },
    {
      title: "SHOP WOMEN",
      slug: "women",
      img: bySlug.get("women")?.image_url || "/images/explore/women.png",
      to: "/category/women",
    },
    {
      title: "SHOP KIDS",
      slug: "kids",
      img: bySlug.get("kids")?.image_url || "/images/explore/kids.png",
      to: "/category/kids",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Explore More</h2>
        <span className="h-1 w-10 rounded bg-yellow-400" />
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.slug}
            to={c.to}
            className="group relative block overflow-hidden rounded-xl"
            aria-label={c.title}
          >
            <img
              src={c.img}
              alt={c.title}
              className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-64"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/25" />
            <div className="pointer-events-none absolute inset-0 flex items-end p-6">
              <span className="text-3xl font-extrabold tracking-wider text-white drop-shadow-md uppercase">
                {c.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
