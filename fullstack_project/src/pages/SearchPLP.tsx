import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Product, type Category } from "@/lib/api";
import { sortProducts, type SortKey } from "@/lib/sorters";
import ProductCard from "@/components/products/ProductCard";
import {
  SkeletonFilterColumn,
  SkeletonGrid,
  SkeletonRightHeader,
} from "@/components/skeleton/PLPskeleton";

/* URL helpers */
const getNum = (p: URLSearchParams, k: string) => {
  const v = p.get(k);
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const setOrDel = (p: URLSearchParams, k: string, v?: string | number | null) => {
  if (v === undefined || v === null || v === "") p.delete(k);
  else p.set(k, String(v));
};
const clearKeys = (p: URLSearchParams, keys: string[]) => {
  const next = new URLSearchParams(p.toString());
  keys.forEach((k) => next.delete(k));
  return next;
};

/* Simple filter block UI */
function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const staticTopTabs = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Kids", slug: "kids" },
  { name: "Footwear", slug: "footwear" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Watches", slug: "watches" },
];

type CardWithPath = Product & {
  _uiParentName?: string | null;
  _uiParentSlug?: string | null;
};

function EmptySearchState({
  query,
  recent,
  onRecentClick,
}: {
  query: string;
  recent: string[];
  onRecentClick: (q: string) => void;
}) {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full border border-zinc-200 bg-white shadow-sm">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-zinc-500">
          <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mx-4 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-800">
        Sorry, there are no matches for “{query}”
      </h2>
      <p className="mt-3 max-w-xl px-4 text-sm leading-6 text-zinc-600">
        Check spelling, try simpler terms, or explore categories from the top bar.
      </p>
      {recent.length > 0 && (
        <div className="mt-8">
          <div className="text-xs font-medium text-zinc-600 mb-2">Recent searches</div>
          <div className="flex flex-wrap justify-center gap-2">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => onRecentClick(r)}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400"
                aria-label={`Search ${r}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const ratingOptions = [4.5, 4.0, 3.5, 3.0];

export default function SearchPLP() {
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q")?.trim() ?? "";
  const q = qParam.slice(0, 120);
  const scope = params.get("scope")?.trim() ?? "";
  const navigate = useNavigate();

  const [products, setProducts] = useState<CardWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [parents, setParents] = useState<Array<{ name: string; slug: string }>>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // recent searches
  const recentKey = "recent_searches_v1";
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(recentKey) || "[]") as string[];
    setRecent(list.slice(0, 5));
  }, []);

  useEffect(() => {
    let cancel = false;

    async function resolveParentMeta(items: Product[]): Promise<CardWithPath[]> {
      const uniqLeafIds = Array.from(new Set(items.map((p) => p.category_id)));
      const leafCats = (await api.categoriesByIds(uniqLeafIds).catch(() => [])) as Category[];
      const leafById = new Map(leafCats.map((c) => [c.id, c]));
      const uniqParentIds = Array.from(new Set(leafCats.map((c) => c.parent_id).filter(Boolean) as string[]));
      const parentCats = (await api.categoriesByIds(uniqParentIds).catch(() => [])) as Category[];
      const parentById = new Map(parentCats.map((c) => [c.id, c]));
      return items.map((p) => {
        const leaf = leafById.get(p.category_id);
        const parent = leaf?.parent_id ? parentById.get(leaf.parent_id) : undefined;
        return {
          ...p,
          _uiParentName: parent?.name ?? null,
          _uiParentSlug: parent?.slug ?? null,
        };
      });
    }

    const run = async () => {
      if (!q) {
        setProducts([]);
        setParents([]);
        setErr(null);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const res = await api.resolveSearch(q);
        let list: Product[] = [];
        if (res.type === "products") {
          list = (res.products as any) ?? [];
        } else if (res.type === "category" || res.type === "subcategory") {
          list = await api.categoryAndChildrenProductsBySlug(res.category.slug, 200);
        } else {
          list = [];
        }
        const withMeta = list.length ? await resolveParentMeta(list) : [];
        const parentMap = new Map<string, string>();
        withMeta.forEach((p) => {
          if (p._uiParentSlug && p._uiParentName) parentMap.set(p._uiParentSlug, p._uiParentName);
        });
        const parentArr = Array.from(parentMap.entries()).map(([slug, name]) => ({ slug, name }));
        const filtered = scope ? withMeta.filter((p) => (p._uiParentSlug ?? "") === scope) : withMeta;
        if (!cancel) {
          setProducts(filtered);
          setParents(parentArr);
        }
        const prev = JSON.parse(localStorage.getItem(recentKey) || "[]") as string[];
        const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        localStorage.setItem(recentKey, JSON.stringify(next));
        if (!cancel) setRecent(next);
      } catch (e: any) {
        if (!cancel) {
          setErr(e?.message || "Search failed");
          setProducts([]);
          setParents([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    run();
    return () => {
      cancel = true;
    };
  }, [q, scope, navigate]);

  // URL-derived filters
  const priceMin = getNum(params, "price_gte");
  const priceMax = getNum(params, "price_lte");
  const ratingMin = getNum(params, "rating_gte");
  const isBestseller = params.get("is_bestseller") === "true";
  const isTrending = params.get("is_trending") === "true";

  // Apply filters before sorting
  const visibleProducts = useMemo(() => {
    let list = products;

    // Price
    if (priceMin != null) list = list.filter((p) => (p.price ?? 0) >= priceMin);
    if (priceMax != null) list = list.filter((p) => (p.price ?? 0) <= priceMax);

    // Rating (supports “No ratings” sentinel -1)
    if (ratingMin === -1) {
      list = list.filter((p) => p.rating == null || p.rating === 0);
    } else if (ratingMin != null) {
      list = list.filter((p) => (p.rating ?? 0) >= ratingMin);
    }

    // Highlights (also honor badge)
    if (isBestseller) {
      list = list.filter(
        (p: any) =>
          p?.is_bestseller === true ||
          p?.tags?.includes?.("bestseller") ||
          p.badge === "Bestseller"
      );
    }
    if (isTrending) {
      list = list.filter(
        (p: any) =>
          p?.is_trending === true ||
          p?.tags?.includes?.("trending") ||
          p.badge === "Trending"
      );
    }

    return sortProducts(list, sort);
  }, [products, sort, priceMin, priceMax, ratingMin, isBestseller, isTrending]);

  const onClickScope = (slug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("scope", slug);
    else next.delete("scope");
    next.delete("page");
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    const next = clearKeys(params, [
      "price_gte",
      "price_lte",
      "rating_gte",
      "is_bestseller",
      "is_trending",
    ]);
    setParams(next, { replace: true });
  };

  return (
    <>
      <Header />
      <div className="mb-2">
        <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
        <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="container">
            <TextCategoryBar kind="level1" basePath="/category" items={staticTopTabs} />
          </div>
        </div>
      </div>

      <main className="container px-3 sm:px-4">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

        {loading && (
          <section className="grid grid-cols-12 gap-4 sm:gap-6 mt-0">
            <aside className="hidden md:block md:col-span-3">
              <SkeletonFilterColumn />
            </aside>
            <div className="col-span-12 md:col-span-9">
              <SkeletonRightHeader withShopFor />
              <SkeletonGrid count={12} />
            </div>
          </section>
        )}

        {!loading && q && products.length > 0 && (
          <section className="grid grid-cols-12 gap-4 sm:gap-6 mt-0">
            {/* Mobile utility bar */}
            <div className="col-span-12 md:hidden flex items-center justify-between gap-3 sticky top-14 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 py-2 px-1">
              <button
                className="inline-flex items-center rounded border px-3 py-2 text-sm"
                onClick={() => setShowMobileFilters(true)}
                aria-label="Open filters"
              >
                Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">{visibleProducts.length} matches</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-md border bg-white px-3 py-2 text-sm shadow-sm"
                  aria-label="Sort results"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="new">Newest First</option>
                </select>
              </div>
            </div>

            {/* Desktop filters */}
            <aside className="hidden md:block md:col-span-3">
              <div className="sticky top-16 pt-0 mt-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">FILTERS</h2>
                  <button className="text-xs text-indigo-600 hover:underline" onClick={clearAll}>
                    Clear all
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Price */}
                  <FilterBlock title="Price">
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        className="w-20 rounded border px-2 py-1 text-sm"
                        placeholder="Min"
                        inputMode="numeric"
                        value={priceMin ?? ""}
                        onChange={(e) => {
                          const next = new URLSearchParams(params.toString());
                          setOrDel(next, "price_gte", e.target.value);
                          next.delete("page");
                          setParams(next, { replace: true });
                        }}
                      />
                      <span>—</span>
                      <input
                        className="w-20 rounded border px-2 py-1 text-sm"
                        placeholder="Max"
                        inputMode="numeric"
                        value={priceMax ?? ""}
                        onChange={(e) => {
                          const next = new URLSearchParams(params.toString());
                          setOrDel(next, "price_lte", e.target.value);
                          next.delete("page");
                          setParams(next, { replace: true });
                        }}
                      />
                    </div>
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:underline"
                      onClick={() => setParams(clearKeys(params, ["price_gte", "price_lte"]), { replace: true })}
                    >
                      Clear
                    </button>
                  </FilterBlock>

                  {/* Rating */}
                  <FilterBlock title="Rating">
                    <div className="flex flex-col gap-2 text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="rating"
                          checked={ratingMin == null}
                          onChange={() =>
                            setParams(clearKeys(params, ["rating_gte"]), { replace: true })
                          }
                        />
                        <span>Any rating</span>
                      </label>

                      {ratingOptions.map((n) => (
                        <label key={n} className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="rating"
                            checked={ratingMin === n}
                            onChange={() => {
                              const next = new URLSearchParams(params.toString());
                              setOrDel(next, "rating_gte", n);
                              next.delete("page");
                              setParams(next, { replace: true });
                            }}
                          />
                          <span>{n.toFixed(1)}+ stars</span>
                        </label>
                      ))}

                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="rating"
                          checked={ratingMin === -1}
                          onChange={() => {
                            const next = new URLSearchParams(params.toString());
                            setOrDel(next, "rating_gte", -1);
                            next.delete("page");
                            setParams(next, { replace: true });
                          }}
                        />
                        <span>No ratings</span>
                      </label>
                    </div>
                  </FilterBlock>

                  {/* Highlights */}
                  <FilterBlock title="Highlights">
                    <div className="flex flex-col gap-2 text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isBestseller}
                          onChange={(e) => {
                            const next = new URLSearchParams(params.toString());
                            setOrDel(next, "is_bestseller", e.target.checked ? "true" : null);
                            next.delete("page");
                            setParams(next, { replace: true });
                          }}
                        />
                        <span>Bestseller</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isTrending}
                          onChange={(e) => {
                            const next = new URLSearchParams(params.toString());
                            setOrDel(next, "is_trending", e.target.checked ? "true" : null);
                            next.delete("page");
                            setParams(next, { replace: true });
                          }}
                        />
                        <span>Trending</span>
                      </label>
                      <button
                        className="self-start text-xs text-indigo-600 hover:underline"
                        onClick={() =>
                          setParams(clearKeys(params, ["is_bestseller", "is_trending"]), { replace: true })
                        }
                      >
                        Clear
                      </button>
                    </div>
                  </FilterBlock>
                </div>
              </div>
            </aside>

            {/* Right: Header + Grid */}
            <div className="col-span-12 md:col-span-9">
              <div className="hidden md:flex mb-3 items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold tracking-wide text-zinc-700">
                    Search results for “{q}”
                  </span>
                  {parents.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-zinc-600">Shop For</span>
                      <button
                        onClick={() => onClickScope(null)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                          !scope ? "bg-black text-white" : "bg-white hover:bg-muted"
                        }`}
                      >
                        All
                      </button>
                      {parents.map((p) => (
                        <button
                          key={p.slug}
                          onClick={() => onClickScope(p.slug)}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                            scope === p.slug ? "bg-black text-white" : "bg-white hover:bg-muted"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-6 flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-600">
                    {visibleProducts.length} matches
                  </span>
                  <span className="text-xs font-medium text-zinc-600">·</span>
                  <span className="text-xs font-medium text-zinc-600">SORT BY</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="rounded-md border bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="new">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              <div className="mb-2 flex flex-wrap gap-2">
                {priceMin != null && (
                  <button
                    className="rounded-full border px-2 py-1 text-xs"
                    onClick={() => setParams(clearKeys(params, ["price_gte"]), { replace: true })}
                  >
                    Min ₹{priceMin} ×
                  </button>
                )}
                {priceMax != null && (
                  <button
                    className="rounded-full border px-2 py-1 text-xs"
                    onClick={() => setParams(clearKeys(params, ["price_lte"]), { replace: true })}
                  >
                    Max ₹{priceMax} ×
                  </button>
                )}
                {ratingMin != null && (
                  <button
                    className="rounded-full border px-2 py-1 text-xs"
                    onClick={() => setParams(clearKeys(params, ["rating_gte"]), { replace: true })}
                  >
                    {ratingMin === -1
                      ? "No ratings"
                      : `${Number(ratingMin).toFixed(Number.isInteger(ratingMin) ? 0 : 1)}+ ★`} ×
                  </button>
                )}
                {isBestseller && (
                  <button
                    className="rounded-full border px-2 py-1 text-xs"
                    onClick={() => setParams(clearKeys(params, ["is_bestseller"]), { replace: true })}
                  >
                    Bestseller ×
                  </button>
                )}
                {isTrending && (
                  <button
                    className="rounded-full border px-2 py-1 text-xs"
                    onClick={() => setParams(clearKeys(params, ["is_trending"]), { replace: true })}
                  >
                    Trending ×
                  </button>
                )}
              </div>

              {/* Grid: compact like category PLP */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
                {visibleProducts.map((p: Product) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && q && products.length === 0 && (
          <EmptySearchState
            query={q}
            recent={recent}
            onRecentClick={(r) => {
              const next = new URLSearchParams(params.toString());
              next.set("q", r);
              next.delete("scope");
              setParams(next, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {!loading && !q && (
          <div className="py-16 text-center text-sm text-zinc-600">
            Start by typing a product, brand, or category.
          </div>
        )}

        <div className="h-10" />
      </main>

      {/* Mobile filters drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${showMobileFilters ? "" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${showMobileFilters ? "opacity-100" : "opacity-0"}`}
          onClick={() => setShowMobileFilters(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl transition-transform ${
            showMobileFilters ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 z-10 -mb-px bg-white px-4 pt-3 pb-2 border-b">
            <div className="mx-auto flex max-w-lg items-center justify-between">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button className="text-sm underline" onClick={() => setShowMobileFilters(false)}>
                Done
              </button>
            </div>
          </div>
          <div className="mx-auto max-w-lg p-4 space-y-4">
            {/* Price */}
            <FilterBlock title="Price">
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="w-24 rounded border px-2 py-1 text-sm"
                  placeholder="Min"
                  inputMode="numeric"
                  value={priceMin ?? ""}
                  onChange={(e) => {
                    const next = new URLSearchParams(params.toString());
                    setOrDel(next, "price_gte", e.target.value);
                    next.delete("page");
                    setParams(next, { replace: true });
                  }}
                />
                <span>—</span>
                <input
                  className="w-24 rounded border px-2 py-1 text-sm"
                  placeholder="Max"
                  inputMode="numeric"
                  value={priceMax ?? ""}
                  onChange={(e) => {
                    const next = new URLSearchParams(params.toString());
                    setOrDel(next, "price_lte", e.target.value);
                    next.delete("page");
                    setParams(next, { replace: true });
                  }}
                />
              </div>
            </FilterBlock>

            {/* Rating */}
            <FilterBlock title="Rating">
              <div className="flex flex-col gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="m_rating"
                    checked={ratingMin == null}
                    onChange={() =>
                      setParams(clearKeys(params, ["rating_gte"]), { replace: true })
                    }
                  />
                  <span>Any rating</span>
                </label>
                {ratingOptions.map((n) => (
                  <label key={n} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="m_rating"
                      checked={ratingMin === n}
                      onChange={() => {
                        const next = new URLSearchParams(params.toString());
                        setOrDel(next, "rating_gte", n);
                        next.delete("page");
                        setParams(next, { replace: true });
                      }}
                    />
                    <span>{n.toFixed(1)}+ stars</span>
                  </label>
                ))}
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="m_rating"
                    checked={ratingMin === -1}
                    onChange={() => {
                      const next = new URLSearchParams(params.toString());
                      setOrDel(next, "rating_gte", -1);
                      next.delete("page");
                      setParams(next, { replace: true });
                    }}
                  />
                  <span>No ratings</span>
                </label>
              </div>
            </FilterBlock>

            {/* Highlights */}
            <FilterBlock title="Highlights">
              <div className="flex flex-col gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => {
                      const next = new URLSearchParams(params.toString());
                      setOrDel(next, "is_bestseller", e.target.checked ? "true" : null);
                      next.delete("page");
                      setParams(next, { replace: true });
                    }}
                  />
                  <span>Bestseller</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => {
                      const next = new URLSearchParams(params.toString());
                      setOrDel(next, "is_trending", e.target.checked ? "true" : null);
                      next.delete("page");
                      setParams(next, { replace: true });
                    }}
                  />
                  <span>Trending</span>
                </label>
              </div>
            </FilterBlock>
          </div>
        </div>
      </div>
    </>
  );
}

