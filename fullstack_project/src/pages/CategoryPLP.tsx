import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Category, type Product } from "@/lib/api";
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

// Static parent categories
const staticTopTabs = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Kids", slug: "kids" },
  { name: "Footwear", slug: "footwear" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Watches", slug: "watches" },
];

/* Reusable Filter block */
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

const ratingOptions = [4.5, 4.0, 3.5, 3.0];

export default function CategoryPLP() {
  const { slug, parentSlug, childSlug } = useParams<{
    slug?: string;
    parentSlug?: string;
    childSlug?: string;
  }>();

  const [params, setParams] = useSearchParams();

  // Resolve route context
  const topSlug = parentSlug ?? slug ?? null; // e.g., "women"
  const subSlug = childSlug ?? null; // e.g., "tops"

  const [parent, setParent] = useState<Category | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [shopFor, setShopFor] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!topSlug) return;
      setLoading(true);
      setError(null);
      try {
        const slugToFetch = subSlug ?? topSlug;
        const page = await api.categoryPage(slugToFetch);
        if (!active) return;

        const me = page.category;

        if (me.parent_id) {
          setParent(
            await (async () => {
              try {
                const p = await api.parentCategoryOf(me.id);
                return p;
              } catch {
                return null;
              }
            })()
          );
          setCategory(me);
          setShopFor([]);
          setProducts(page.products ?? []);
        } else {
          setParent(null);
          setCategory(me);
          setShopFor(page.children ?? []);
          setProducts(page.products ?? []);
        }
      } catch (e: any) {
        if (!active) return;
        setError(e.message ?? "Failed to load category");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [topSlug, subSlug]);

  const showShopFor = useMemo(() => shopFor.length > 0, [shopFor]);

  // URL-derived filters
  const priceMin = getNum(params, "price_gte");
  const priceMax = getNum(params, "price_lte");
  const ratingMin = getNum(params, "rating_gte");
  const isBestseller = params.get("is_bestseller") === "true";
  const isTrending = params.get("is_trending") === "true";

  // Apply filters then sort
  const visibleProducts = useMemo(() => {
    let list = products;
    if (priceMin != null) list = list.filter((p) => (p.price ?? 0) >= priceMin);
    if (priceMax != null) list = list.filter((p) => (p.price ?? 0) <= priceMax);
    if (ratingMin === -1) list = list.filter((p) => p.rating == null || p.rating === 0);
    else if (ratingMin != null) list = list.filter((p) => (p.rating ?? 0) >= ratingMin);
    if (isBestseller)
      list = list.filter(
        (p) =>
          (p as any).is_bestseller === true ||
          (p as any).tags?.includes("bestseller") ||
          p.badge === "Bestseller"
      );
    if (isTrending)
      list = list.filter(
        (p) =>
          (p as any).is_trending === true ||
          (p as any).tags?.includes("trending") ||
          p.badge === "Trending"
      );
    return sortProducts(list, sort);
  }, [products, sort, priceMin, priceMax, ratingMin, isBestseller, isTrending]);

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

      {/* Common parent category bar */}
      <div className="mb-2">
        <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
        <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="container">
            <TextCategoryBar
              kind="level1"
              basePath="/category"
              items={staticTopTabs}
              activeSlug={(parent ?? category)?.slug}
            />
          </div>
        </div>
      </div>

      <main className="container px-3 sm:px-4">
        {loading ? (
          <section className="grid grid-cols-12 gap-4 sm:gap-6 mt-0">
            <aside className="hidden md:block md:col-span-3">
              <SkeletonFilterColumn />
            </aside>
            <div className="col-span-12 md:col-span-9">
              <SkeletonRightHeader withShopFor />
              <SkeletonGrid count={12} />
            </div>
          </section>
        ) : (
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
                <span className="text-xs text-zinc-600">{visibleProducts.length} results</span>
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

            {/* Left: Filters desktop */}
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
                          onChange={() => setParams(clearKeys(params, ["rating_gte"]), { replace: true })}
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
                        onClick={() => setParams(clearKeys(params, ["is_bestseller", "is_trending"]), { replace: true })}
                      >
                        Clear
                      </button>
                    </div>
                  </FilterBlock>
                </div>
              </div>
            </aside>

            {/* Right: Content */}
            <div className="col-span-12 md:col-span-9">
              {/* Breadcrumbs */}
              <nav className="mb-2 text-sm text-gray-500" aria-label="Breadcrumb">
                <Link to="/" className="text-gray-500 hover:text-yellow-500 hover:underline">
                  Home
                </Link>
                {parent && (
                  <>
                    <span className="mx-2">›</span>
                    <Link
                      to={`/category/${parent.slug}`}
                      className="text-gray-500 hover:text-yellow-500 hover:underline"
                    >
                      {parent.name}
                    </Link>
                  </>
                )}
                {category && (
                  <>
                    <span className="mx-2">›</span>
                    <span className="text-gray-500">{category.name}</span>
                  </>
                )}
              </nav>

              {/* Shop For chips + Sort (desktop) */}
              <div className="hidden md:flex items-center justify-between pb-2">
                <div className="flex items-center gap-3 min-w-0">
                  {showShopFor && (
                    <span className="text-sm font-semibold tracking-wide text-zinc-700">Shop For</span>
                  )}
                  {showShopFor && (
                    <nav className="flex flex-wrap gap-2">
                      {shopFor.map((c) => (
                        <Link
                          key={c.id}
                          to={`/category/${category!.slug}/${c.slug}`}
                          className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-white hover:bg-muted transition"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </nav>
                  )}
                </div>
                <div className="ml-6 flex items-center gap-2">
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
              <div className="mb-3 text-sm">
                Products for {category?.name ?? "Category"}:{" "}
                <span className="text-muted-foreground">{visibleProducts.length} available</span>
              </div>
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

              {/* Product grid: denser columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
                {visibleProducts
                  .filter((p) => !!p?.id)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>

              {visibleProducts.length === 0 && (
                <p className="mt-6 text-sm text-muted-foreground">No products found in this category.</p>
              )}
            </div>
          </section>
        )}

        <div className="h-10" />
      </main>

      {/* Mobile filters drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${showMobileFilters ? "" : "pointer-events-none"}`} aria-hidden={!showMobileFilters}>
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
                    onChange={() => setParams(clearKeys(params, ["rating_gte"]), { replace: true })}
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
