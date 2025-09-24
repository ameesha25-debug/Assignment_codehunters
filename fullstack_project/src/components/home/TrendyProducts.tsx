import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { type Product as CardProduct } from "@/lib/api";

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
  category_id: string | null; // present in RPC result
  created_at: string;
};

type CardWithPath = CardProduct & {
  uiParent?: string;
  uiParentSlug?: string;
  uiLeaf?: string;
  uiLeafSlug?: string;
};

export default function TrendyProducts() {
  const [active, setActive] = useState<Tab>("BESTSELLER");
  const [items, setItems] = useState<CardWithPath[]>([]);
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

        // Base cards
        const base: CardProduct[] = rows.slice(0, 8).map((r) => ({
          id: r.id,
          name: r.name,
          price: r.price,
          rating: r.rating,
          review_count: r.review_count,
          badge: r.badge,
          category_id: r.category_id ?? "", // Provide fallback if null
          created_at: r.created_at,
          image_url: r.image_url ?? "/images/placeholder.png",
          category: r.category,
        }));

        // Attach category path to each card
        const cards = await Promise.all(
          base.map(async (card, i) => {
            const row = rows[i];
            let leaf: Awaited<ReturnType<typeof api.getCategory>> | null = null;
            let parent: Awaited<
              ReturnType<typeof api.parentCategoryOf>
            > | null = null;

            if (row.category_id) {
              leaf = await api.getCategory(row.category_id).catch(() => null);
              parent = leaf
                ? await api.parentCategoryOf(leaf.id).catch(() => null)
                : null;
            } else {
              // fallback via product lookup
              const p = await api.productById(card.id).catch(() => null);
              if (p) {
                leaf = await api.getCategory(p.category_id).catch(() => null);
                parent = leaf
                  ? await api.parentCategoryOf(leaf.id).catch(() => null)
                  : null;
              }
            }

            return {
              ...card,
              uiParent: parent?.name,
              uiParentSlug: parent?.slug,
              uiLeaf: leaf?.name,
              uiLeafSlug: leaf?.slug,
            } as CardWithPath;
          })
        );

        if (!cancel) setItems(cards);
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
      <h2 className="text-center text-2xl font-semibold tracking-wide">
        OUR TRENDY PRODUCTS
      </h2>

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

      {err && <p className="mt-4 text-center text-xs text-red-500">{err}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-md bg-muted/40"
              />
            ))
          : items.map((p) => (
              <div key={p.id} className="card-hover">
                {/* Small context line above card: Parent · Leaf */}
                {(p.uiParent || p.uiLeaf) && (
                  <div className="mb-1 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {p.uiParent ?? "Category"}
                    {p.uiLeaf ? ` · ${p.uiLeaf}` : ""}
                  </div>
                )}
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}
