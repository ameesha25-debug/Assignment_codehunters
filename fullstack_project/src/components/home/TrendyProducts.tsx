import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/components/products/ProductCard";
import { useState } from "react";

const mock: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `p-${i}`,
  title: ["Hoodie","T-Shirts","Jacket","Jersey T-Shirts","Cotton Shirts","Red Dress","Formals","Sherwani"][i] || `Product ${i+1}`,
  image: `/images/products/p${(i%8)+1}.jpg`,
  price: [15,17,16,10,13,11,22,25][i] ?? 19,
  strikePrice: [undefined, undefined, 18, undefined, undefined, undefined, undefined, undefined][i],
  rating: 3.8 + (i % 5) * 0.2,
  badge: i % 4 === 0 ? "Best Seller" : undefined,
}));

const tabs = ["ALL", "NEW ARRIVALS", "BEST SELLER", "TOP RATED"] as const;

export default function TrendyProducts() {
  const [active, setActive] = useState<typeof tabs[number]>("ALL");

  return (
    <section className="section">
      <h2 className="text-center text-2xl font-semibold tracking-wide">OUR TRENDY PRODUCTS</h2>

      <div className="tabs-inline mx-auto mt-4 flex w-full max-w-xl items-center justify-between">
        {tabs.map(t => (
          <button
            key={t}
            data-active={active === t}
            onClick={() => setActive(t)}
            className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mock.map(p => (
          <div key={p.id} className="card-hover">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="underline-btn">DISCOVER MORE</button>
      </div>
    </section>
  );
}

