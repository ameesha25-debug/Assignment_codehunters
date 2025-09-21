// import ProductCard from "@/components/products/ProductCard";
// import type { Product } from "@/components/products/ProductCard";
// import { useState } from "react";

// const mock: Product[] = Array.from({ length: 8 }).map((_, i) => ({
//   id: `p-${i}`,
//   title: ["Hoodie","T-Shirts","Jacket","Jersey T-Shirts","Cotton Shirts","Red Dress","Formals","Sherwani"][i] || `Product ${i+1}`,
//   image: `/images/products/p${(i%8)+1}.jpg`,
//   price: [15,17,16,10,13,11,22,25][i] ?? 19,
//   strikePrice: [undefined, undefined, 18, undefined, undefined, undefined, undefined, undefined][i],
//   rating: 3.8 + (i % 5) * 0.2,
//   badge: i % 4 === 0 ? "Best Seller" : undefined,
// }));

// const tabs = ["ALL", "NEW ARRIVALS", "BEST SELLER", "TOP RATED"] as const;

// export default function TrendyProducts() {
//   const [active, setActive] = useState<typeof tabs[number]>("ALL");

//   return (
//     <section className="section">
//       <h2 className="text-center text-2xl font-semibold tracking-wide">OUR TRENDY PRODUCTS</h2>

//       <div className="tabs-inline mx-auto mt-4 flex w-full max-w-xl items-center justify-between">
//         {tabs.map(t => (
//           <button
//             key={t}
//             data-active={active === t}
//             onClick={() => setActive(t)}
//             className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
//           >
//             {t}
//           </button>
//         ))}
//       </div>

//       <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {mock.map(p => (
//           <div key={p.id} className="card-hover">
//             <ProductCard product={p} />
//           </div>
//         ))}
//       </div>

//       <div className="mt-8 text-center">
//         <button className="underline-btn">DISCOVER MORE</button>
//       </div>
//     </section>
//   );
// }


// components/TrendyProducts.tsx
// src/components/home/TrendyProducts.tsx
import { useEffect, useState } from "react";
import ProductCard, { type Product as CardProduct } from "@/components/products/ProductCard";
import { api } from "@/lib/api";

const tabs = ["BESTSELLER", "TRENDING"] as const;
type Tab = (typeof tabs)[number];

type Row = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  badge: string | null;
  category: string | null;
  created_at: string;
};

export default function TrendyProducts() {
  const [active, setActive] = useState<Tab>("BESTSELLER");
  const [items, setItems] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const badge = active === "BESTSELLER" ? "Bestseller" : "Trending";
        const rows = (await api.trendyByBadge(badge, 8)) as Row[];
        if (cancel) return;
        const mapped: CardProduct[] = rows.slice(0, 8).map((r) => ({
          id: r.id,
          title: r.name,
          image: r.image_url ?? "/images/placeholder.png",
          price: r.price,
          strikePrice: undefined,
          rating: r.rating ?? 4.0,
          badge: r.badge ?? undefined,
        }));
        setItems(mapped);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "Failed to load products");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [active]);

  return (
    <section className="section">
      <h2 className="text-center text-2xl font-semibold tracking-wide">OUR TRENDY PRODUCTS</h2>

      <div className="mx-auto mt-3 flex w-full max-w-xs items-center justify-center gap-6">
        {tabs.map((t) => (
          <button
            key={t}
            data-active={active === t}
            onClick={() => setActive(t)}
            className="px-2 py-1 text-xs text-muted-foreground data-[active=true]:text-foreground data-[active=true]:font-medium"
          >
            {t}
          </button>
        ))}
      </div>

      {err && (
        <p className="mt-4 text-center text-xs text-red-500">{err}</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-md bg-muted/40" />
            ))
          : items.map((p) => (
              <div key={p.id} className="card-hover">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}
