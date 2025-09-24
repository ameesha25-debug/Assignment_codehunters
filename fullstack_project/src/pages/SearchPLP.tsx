import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Product, type Category } from "@/lib/api";
import { sortProducts, type SortKey } from "@/lib/sorters";
import ProductCard from "@/components/products/ProductCard";

import {
  SkeletonFilterColumn,
  SkeletonGrid,
  SkeletonRightHeader,
  SkeletonEmptyState,
} from "@/components/skeleton/PLPskeleton";

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
        <button className="text-xs text-indigo-600 hover:underline">
          Clear
        </button>
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
  const [parents, setParents] = useState<Array<{ name: string; slug: string }>>(
    []
  );

  // recent searches
  const recentKey = "recent_searches_v1";
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const list = JSON.parse(
      localStorage.getItem(recentKey) || "[]"
    ) as string[];
    setRecent(list.slice(0, 5));
  }, []);

  useEffect(() => {
    let cancel = false;

    async function resolveParentMeta(
      items: Product[]
    ): Promise<CardWithPath[]> {
      const uniqLeafIds = Array.from(new Set(items.map((p) => p.category_id)));
      const leafCats = (await api
        .categoriesByIds(uniqLeafIds)
        .catch(() => [])) as Category[];
      const leafById = new Map(leafCats.map((c) => [c.id, c]));

      const uniqParentIds = Array.from(
        new Set(leafCats.map((c) => c.parent_id).filter(Boolean) as string[])
      );
      const parentCats = (await api
        .categoriesByIds(uniqParentIds)
        .catch(() => [])) as Category[];
      const parentById = new Map(parentCats.map((c) => [c.id, c]));

      return items.map((p) => {
        const leaf = leafById.get(p.category_id);
        const parent = leaf?.parent_id
          ? parentById.get(leaf.parent_id)
          : undefined;
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

        // Redirect to canonical category pages if a category/subcategory match
        if (res.type === "category") {
          navigate(`/category/${res.category.slug}`, { replace: true });
          return;
        }
        if (res.type === "subcategory") {
          navigate(`/category/${res.parent.slug}/${res.category.slug}`, {
            replace: true,
          });
          return;
        }

        let list: Product[] = [];
        if (res.type === "products") list = res.products as any;
        const withMeta = list.length ? await resolveParentMeta(list) : [];

        // Build parent facets and apply scope if present
        const parentMap = new Map<string, string>();
        withMeta.forEach((p) => {
          if (p._uiParentSlug && p._uiParentName)
            parentMap.set(p._uiParentSlug, p._uiParentName);
        });
        const parentArr = Array.from(parentMap.entries()).map(
          ([slug, name]) => ({ slug, name })
        );

        const filtered = scope
          ? withMeta.filter((p) => (p._uiParentSlug ?? "") === scope)
          : withMeta;

        if (!cancel) {
          setProducts(filtered);
          setParents(parentArr);
        }

        // Save recent
        const prev = JSON.parse(
          localStorage.getItem(recentKey) || "[]"
        ) as string[];
        const next = [
          q,
          ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase()),
        ].slice(0, 5);
        localStorage.setItem(recentKey, JSON.stringify(next));
        if (!cancel) setRecent(next);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "Search failed");
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    run();
    return () => {
      cancel = true;
    };
  }, [q, scope, navigate]);

  // Use shared sorter
  const sortedProducts = useMemo(
    () => sortProducts(products, sort),
    [products, sort]
  );

  const onClickScope = (slug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("scope", slug);
    else next.delete("scope");
    setParams(next, { replace: true });
  };

  return (
    <>
      <Header />

      {/* Common top bar */}
      <div className="mb-2">
        <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
        <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="container">
            <TextCategoryBar
              kind="level1"
              basePath="/category"
              items={staticTopTabs}
            />
          </div>
        </div>
      </div>

      <main className="container">
        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

        {/* Loading skeleton */}
        {loading && (
          <section className="grid grid-cols-12 gap-6 mt-0">
            <aside className="hidden md:block md:col-span-3">
              <SkeletonFilterColumn />
            </aside>
            <div className="col-span-12 md:col-span-9">
              <SkeletonRightHeader withShopFor />
              <SkeletonGrid count={12} />
            </div>
          </section>
        )}

        {/* Results with filters and right-column header */}
        {!loading && products.length > 0 && (
          <section className="grid grid-cols-12 gap-6 mt-0">
            {/* Left: Filters */}
            <aside className="hidden md:block md:col-span-3">
              <div className="sticky top-16 pt-0 mt-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">FILTERS</h2>
                  <button className="text-xs text-indigo-600 hover:underline">
                    Clear all
                  </button>
                </div>

                <div className="space-y-4">
                  <FilterBlock title="Price">
                    <div className="h-2 rounded-full bg-muted" />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        className="w-20 rounded border px-2 py-1 text-sm"
                        placeholder="Min"
                      />
                      <span>—</span>
                      <input
                        className="w-20 rounded border px-2 py-1 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </FilterBlock>

                  <FilterBlock title="Color">
                    <div className="flex flex-wrap gap-2">
                      {["Black", "White", "Blue", "Pink", "Green"].map((c) => (
                        <button
                          key={c}
                          className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </FilterBlock>

                  <FilterBlock title="Size">
                    <div className="flex flex-wrap gap-2">
                      {["XS", "S", "M", "L", "XL"].map((s) => (
                        <button
                          key={s}
                          className="rounded border px-3 py-1 text-sm hover:bg-muted"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </FilterBlock>

                  <FilterBlock title="Discount">
                    <div className="flex flex-col gap-2 text-sm">
                      {[
                        "10% and above",
                        "20% and above",
                        "30% and above",
                        "50% and above",
                      ].map((d) => (
                        <label
                          key={d}
                          className="inline-flex items-center gap-2"
                        >
                          <input type="checkbox" className="rounded border" />
                          <span>{d}</span>
                        </label>
                      ))}
                    </div>
                  </FilterBlock>
                </div>
              </div>
            </aside>

            {/* Right: Header + Grid */}
            <div className="col-span-12 md:col-span-9">
              {/* Right-side header row */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold tracking-wide text-zinc-700">
                    Search results for “{q}”
                  </span>
                  {parents.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-zinc-600">
                        Shop For
                      </span>
                      <button
                        onClick={() => onClickScope(null)}
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                          !scope
                            ? "bg-black text-white"
                            : "bg-white hover:bg-muted"
                        }`}
                      >
                        All
                      </button>
                      {parents.map((p) => (
                        <button
                          key={p.slug}
                          onClick={() => onClickScope(p.slug)}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${
                            scope === p.slug
                              ? "bg-black text-white"
                              : "bg-white hover:bg-muted"
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
                    {products.length} matches
                  </span>
                  <span className="text-xs font-medium text-zinc-600">·</span>
                  <span className="text-xs font-medium text-zinc-600">
                    SORT BY
                  </span>
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

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {sortedProducts.map((p: Product) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty state: no filters, no sort */}
        {!loading && products.length === 0 && <SkeletonEmptyState />}

        <div className="h-10" />
      </main>
    </>
  );
}
