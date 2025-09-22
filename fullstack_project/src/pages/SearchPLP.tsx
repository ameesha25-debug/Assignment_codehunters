import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar"; // adjust path if needed
import { api } from "@/lib/api";

type ProductRow = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  category_id: string;
  rating?: number | null;
  review_count?: number | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export default function SearchPLP() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const { pathname } = useLocation();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);

      const res = await api.resolveSearch(q);
      if (!active) return;

      if (res.type === "products") {
        const items = (res.products as any[]).map((p) => ({
          id: p.id,
          name: p.name,
          image_url: p.image_url ?? null,
          price: p.price ?? 0,
          category_id: p.category_id,
          rating: p.rating ?? null,
          review_count: p.review_count ?? null,
        })) as ProductRow[];

        setProducts(items);

        const catIds = Array.from(new Set(items.map((p) => p.category_id)));
        if (catIds.length > 0) {
          const fetched = (await api.categoriesByIds(catIds)) as any as CategoryRow[];
          const parentIds = Array.from(
            new Set(fetched.filter((c) => c.parent_id).map((c) => c.parent_id as string))
          );

          let parents: CategoryRow[] = [];
          if (parentIds.length > 0) {
            parents = (await api.categoriesByIds(parentIds)) as any as CategoryRow[];
          }

          const topLevel: Record<string, CategoryRow> = {};
          for (const c of fetched) {
            if (c.parent_id) {
              const parent = parents.find((p) => p.id === c.parent_id);
              if (parent) topLevel[parent.id] = parent;
            } else {
              topLevel[c.id] = c;
            }
          }
          setCats(Object.values(topLevel));
        } else {
          setCats([]);
        }

        setLoading(false);
        return;
      }

      setProducts([]);
      setCats([]);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [q]);

  const resultCount = useMemo(() => products.length, [products]);

  const navItems = [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Kids", slug: "kids" },
    { name: "Footwear", slug: "footwear" },
    { name: "Bags", slug: "bags" },
    { name: "Beauty", slug: "beauty" },
    { name: "Watches", slug: "watches" },
  ];
  const activeTop = navItems.find((i) => pathname.startsWith(`/category/${i.slug}`))?.slug;

  return (
    <>
      <Header />

      {/* Category text header (no extra border wrapper) */}
      <div>
        <div className="container">
          <TextCategoryBar kind="level1" items={navItems} activeSlug={activeTop} />
        </div>
      </div>

      <main className="container">
        <section className="grid grid-cols-12 gap-6 mt-0">
          {/* Left: filters */}
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-16 pt-0 mt-0">
              {/* Heading row with bottom gap */}
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">FILTERS</h2>
                <button className="text-xs text-indigo-600 hover:underline">Clear all</button>
              </div>

              {/* Stack of filter blocks with vertical spacing */}
              <div className="space-y-4">
                <FilterBlock title="Price">
                  <div className="h-2 rounded-full bg-muted" />
                  <div className="mt-2 flex items-center gap-2">
                    <input className="w-20 rounded border px-2 py-1 text-sm" placeholder="Min" />
                    <span>—</span>
                    <input className="w-20 rounded border px-2 py-1 text-sm" placeholder="Max" />
                  </div>
                </FilterBlock>

                <FilterBlock title="Color">
                  <div className="flex flex-wrap gap-2">
                    {["Black", "White", "Blue", "Pink", "Green"].map((c) => (
                      <button key={c} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">
                        {c}
                      </button>
                    ))}
                  </div>
                </FilterBlock>

                <FilterBlock title="Size">
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL"].map((s) => (
                      <button key={s} className="rounded border px-3 py-1 text-sm hover:bg-muted">
                        {s}
                      </button>
                    ))}
                  </div>
                </FilterBlock>

                <FilterBlock title="Fit">
                  <div className="flex flex-wrap gap-2">
                    {["Slim", "Regular", "Relaxed"].map((f) => (
                      <button key={f} className="rounded border px-3 py-1 text-sm hover:bg-muted">
                        {f}
                      </button>
                    ))}
                  </div>
                </FilterBlock>

                <FilterBlock title="Discount">
                  <div className="flex flex-col gap-2 text-sm">
                    {["10% and above", "20% and above", "30% and above", "50% and above"].map((d) => (
                      <label key={d} className="inline-flex items-center gap-2">
                        <input type="checkbox" className="rounded border" />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </FilterBlock>
              </div>
            </div>
          </aside>

          {/* Right: content above grid and grid */}
          <div className="col-span-12 md:col-span-9">
            {/* Breadcrumbs */}
            <nav className="mb-3 text-sm text-gray-500 flex items-center" aria-label="Breadcrumb">
              <Link to="/" className="text-gray-500 hover:text-yellow-500 hover:underline">Home</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-500">Search</span>
              {q && (
                <>
                  <span className="mx-2">›</span>
                  <span className="text-gray-700">{q}</span>
                </>
              )}
            </nav>

            {/* Shop For + Sort */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold tracking-wide text-zinc-700">Shop For</span>
                <nav className="flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-50"
                    >
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="ml-6 flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-600">SORT BY</span>
                <select className="rounded-md border bg-white px-3 py-2 text-sm" defaultValue="relevance">
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="new">Newest First</option>
                </select>
              </div>
            </div>

            {/* You searched for */}
            <div className="mb-3 text-sm">
              You searched for <span className="font-semibold">{q}</span>:{" "}
              <span className="text-muted-foreground">{resultCount} products available</span>
            </div>

            {loading ? (
              <div className="py-8 text-sm text-muted-foreground">Loading…</div>
            ) : resultCount === 0 ? (
              <NoMatches q={q} />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products
                  .filter((p) => !!p?.id)
                  .map((p) => {
                    const title = p.name ?? "";
                    const img = p.image_url ?? `https://picsum.photos/seed/${p.id}/600/800`;
                    return (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow"
                        aria-label={title}
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-muted">
                          <img
                            src={img}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>

                        <div className="p-3">
                          <h3 className="line-clamp-2 text-sm font-medium">{title}</h3>
                          <div className="mt-1 text-sm text-foreground">₹{p.price}</div>
                          {p.rating != null && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {p.rating} ★ · {p.review_count ?? 0}
                            </div>
                          )}
                        </div>

                        <button
                          className="absolute right-2 top-2 hidden rounded-full border bg-white p-2 text-foreground shadow-sm group-hover:inline-flex"
                          aria-label="Add to wishlist"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ♡
                        </button>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
        </section>

        <div className="h-10" />
      </main>
    </>
  );
}

/* Reusable filter block */
function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button className="text-xs text-indigo-600 hover:underline">Clear</button>
      </div>
      {children}
    </div>
  );
}

function NoMatches({ q }: { q: string }) {
  return (
    <div className="mx-auto max-w-3xl py-16 text-center">
      <div className="mx-auto mb-6 h-20 w-24 opacity-70">
        <div className="text-6xl">🔎</div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Sorry, there are no matches for “{q}”
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Check your spelling, use different keywords and try again
      </p>
    </div>
  );
}
