import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Category, type Product } from "@/lib/api";

export default function CategoryPLP() {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [siblings, setSiblings] = useState<Category[]>([]);
  const [children, setChildren] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .categoryPage(slug)
      .then(({ category, siblings, children, products }) => {
        setCategory(category);
        setSiblings(siblings);
        setChildren(children);
        setProducts(products);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Header />

      {category && siblings.length > 0 && (
        <div className="mb-2">
          <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
          <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="container">
              <TextCategoryBar
                kind="level1"
                items={siblings.map((s) => ({ name: s.name, slug: s.slug }))}
                activeSlug={category.slug}
              />
            </div>
          </div>
        </div>
      )}

      <main className="container">
        {/* Header strip just under tabs */}
        <div className="mb-2 grid grid-cols-12 gap-6">
          {/* Left: FILTERS title row (tight) */}
          <div className="col-span-12 md:col-span-3">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-foreground">FILTERS</h2>
              <button className="text-xs text-indigo-600 hover:underline">Clear all</button>
            </div>
          </div>

          {/* Right: breadcrumbs + Shop For + Count/Sort */}
          <div className="col-span-12 md:col-span-9">
            <nav className="mb-2 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link to="/" className="text-gray-500 hover:text-yellow-500 hover:underline">Home</Link>
              {category && (
                <>
                  <span className="mx-2">›</span>
                  <span className="text-gray-500">{category.name}</span>
                </>
              )}
            </nav>

            {children.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-base font-semibold">Shop For</span>
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${category!.slug}/${c.slug}`}
                      className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-white hover:bg-muted transition"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && (
              <div className="mb-0 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Products for {category?.name ?? "Category"}: {products.length} available
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">SORT BY</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-md border bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="new">Newest First</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters + products */}
        <section className="grid grid-cols-12 gap-6 mt-0">
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-16 space-y-3 pt-0 mt-0">
              <div className="[&>*:first-child]:mt-0">
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

          <div className="col-span-12 md:col-span-9">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="text-sm text-muted-foreground">Loading products…</p>}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const title = (p as any).name ?? (p as any).title ?? "";
                const img =
                  (p as any).image_url ??
                  (p as any).image ??
                  `https://picsum.photos/seed/${p.id}/600/800`;

                return (
                  <article
                    key={p.id}
                    className="group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow"
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
                    >
                      ♡
                    </button>
                  </article>
                );
              })}
            </div>

            {!loading && products.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No products found in this category.</p>
            )}
          </div>
        </section>

        <div className="h-10" />
      </main>
    </>
  );
}

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
