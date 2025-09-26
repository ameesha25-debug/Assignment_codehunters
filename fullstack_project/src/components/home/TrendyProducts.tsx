import { useEffect, useRef, useState } from "react";
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
  category_id: string | null;
  created_at: string;
};

type CardWithPath = CardProduct & {
  uiParent?: string;
  uiParentSlug?: string;
  uiLeaf?: string;
  uiLeafSlug?: string;
};

function CardSkeleton() {
  return (
    <div className="shrink-0 snap-start scroll-ml-3 w-[180px] sm:w-[200px] md:w-[220px]">
      <div className="mb-1 px-1">
        <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
      </div>
      <div className="rounded-md border p-1.5">
        <div className="relative mb-2 w-full overflow-hidden rounded-md">
          <div className="aspect-[4/5] w-full animate-pulse rounded-md bg-muted/40" />
        </div>
        <div className="space-y-1.5 px-1">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted/40" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted/40" />
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="h-3.5 w-12 animate-pulse rounded bg-muted/40" />
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted/40" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted/40" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted/40" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted/40" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-muted/40" />
          </div>
        </div>
        <div className="mt-2 h-8 w-full animate-pulse rounded-md bg-muted/40" />
      </div>
    </div>
  );
}

export default function TrendyProducts() {
  const [active, setActive] = useState<Tab>("BESTSELLER");
  const [items, setItems] = useState<CardWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const badge = active === "BESTSELLER" ? "Bestseller" : "Trending";
        const rows = (await api.trendyByBadge(badge, 8)) as Row[];

        const base: CardProduct[] = rows.slice(0, 8).map((r) => ({
          id: r.id,
          name: r.name,
          price: r.price,
          rating: r.rating,
          review_count: r.review_count,
          badge: r.badge,
          category_id: r.category_id ?? "",
          created_at: r.created_at,
          image_url: r.image_url ?? "/images/placeholder.png",
          category: r.category,
        }));

        const cards = await Promise.all(
          base.map(async (card, i) => {
            const row = rows[i];
            let leaf: Awaited<ReturnType<typeof api.getCategory>> | null = null;
            let parent: Awaited<ReturnType<typeof api.parentCategoryOf>> | null = null;

            if (row.category_id) {
              leaf = await api.getCategory(row.category_id).catch(() => null);
              parent = leaf ? await api.parentCategoryOf(leaf.id).catch(() => null) : null;
            } else {
              const p = await api.productById(card.id).catch(() => null);
              if (p) {
                leaf = await api.getCategory(p.category_id).catch(() => null);
                parent = leaf ? await api.parentCategoryOf(leaf.id).catch(() => null) : null;
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

  const scrollBy = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth - 48;
    const delta = dir === "next" ? amount : -amount;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.scrollLeft += delta;
    } else {
      el.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

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

      <div className="relative mt-6">
        {/* Controls */}
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => scrollBy("prev")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background/80 p-3 shadow-sm backdrop-blur md:-left-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next products"
          onClick={() => scrollBy("next")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background/80 p-3 shadow-sm backdrop-blur md:-right-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Horizontal carousel (compact) */}
        <div
          ref={scrollerRef}
          role="list"
          className="
            flex gap-3 overflow-x-auto px-1 pb-2
            hide-scrollbar
            scroll-smooth
            snap-x snap-mandatory
            scroll-px-3
          "
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : items.map((p) => (
                <div
                  key={p.id}
                  role="listitem"
                  className="shrink-0 snap-start scroll-ml-3 w-[180px] sm:w-[200px] md:w-[220px]"
                >
                  {(p.uiParent || p.uiLeaf) && (
                    <div className="mb-1 px-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                      {p.uiParent ?? "Category"}
                      {p.uiLeaf ? ` · ${p.uiLeaf}` : ""}
                    </div>
                  )}
                  <ProductCard product={p} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
