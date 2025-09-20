import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type Category, type Product } from "../lib/api";
import TextCategoryBar from "../components/common/TextCategoryBar";

export default function CategoryPLP() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [siblings, setSiblings] = useState<Category[]>([]);
  const [children, setChildren] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    <main className="mx-auto max-w-[1200px] px-4">
      {/* top spacer to mimic navbar height */}
      <div className="h-4" />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-3" aria-label="Breadcrumb">
        <Link to="/" className="text-indigo-600 hover:underline">Home</Link>
        {category && (
          <>
            <span className="mx-1">›</span>
            <span className="text-gray-900">{category.name}</span>
          </>
        )}
      </nav>

      {/* Title */}
      <div className="flex items-end justify-between mb-3">
        <h1 className="text-2xl font-semibold">{category?.name ?? "Category"}</h1>
        {!loading && (
          <div className="text-sm text-gray-500">{products.length} products</div>
        )}
      </div>

      {/* Top categories bar (siblings) */}
      {category && (
        <TextCategoryBar
          kind="level1"
          items={siblings.map((s) => ({ name: s.name, slug: s.slug }))}
          activeSlug={category.slug}
        />
      )}

      {/* Shop For row */}
      {children.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-2 mb-2">
            <h2 className="text-base font-semibold">Shop For</h2>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            {children.map((c) => (
              <Link
                key={c.id}
                to={`/category/${category!.slug}/${c.slug}`}
                className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-white hover:bg-gray-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Grid with left filters rail */}
      <section className="grid grid-cols-12 gap-6">
        {/* Filters rail (placeholder) */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-4 space-y-4">
            <FilterBlock title="Price">
              <div className="h-2 bg-gray-200 rounded-full" />
              <div className="mt-2 flex items-center gap-2">
                <input className="w-20 rounded border px-2 py-1 text-sm" placeholder="Min" />
                <span>—</span>
                <input className="w-20 rounded border px-2 py-1 text-sm" placeholder="Max" />
              </div>
            </FilterBlock>

            <FilterBlock title="Color">
              <div className="flex flex-wrap gap-2">
                {["Black", "White", "Blue", "Pink", "Green"].map((c) => (
                  <button key={c} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50">
                    {c}
                  </button>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Size">
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL"].map((s) => (
                  <button key={s} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                    {s}
                  </button>
                ))}
              </div>
            </FilterBlock>
          </div>
        </aside>

        {/* Product grid */}
        <div className="col-span-12 md:col-span-9 lg:col-span-9">
          {/* Sort row */}
          <div className="mb-3 flex items-center justify-end">
            <label className="mr-2 text-sm text-gray-600">Sort by</label>
            <select className="rounded border px-3 py-2 text-sm bg-white">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {loading && <p className="text-sm text-gray-600">Loading products…</p>}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const displayImage =
                (p as any).image_url ??
                (p as any).image ??
                `https://picsum.photos/seed/${p.id}/600/800`;

              console.log(
                "card img ->",
                displayImage,
                "title ->",
                (p as any).name ?? (p as any).title
              );

              return (
                <article key={p.id} className="group rounded-lg border bg-white overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img
                      src={displayImage}
                      alt={(p as any).name ?? (p as any).title ?? ""}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {(p as any).name ?? (p as any).title}
                    </h3>
                    <div className="mt-1 text-sm text-gray-700">₹{p.price}</div>
                    {p.rating != null && (
                      <div className="mt-1 text-xs text-gray-500">
                        {p.rating} ★ · {p.review_count ?? 0}
                      </div>
                    )}
                  </div>
                  <button className="absolute m-2 hidden rounded-full border bg-white p-2 text-gray-700 group-hover:inline-flex">
                    ♡
                  </button>
                </article>
              );
            })}
          </div>

          {!loading && products.length === 0 && (
            <p className="mt-6 text-sm text-gray-600">No products found in this category.</p>
          )}
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}

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
        <button className="text-xs text-indigo-600 hover:underline">Clear</button>
      </div>
      {children}
    </div>
  );
}
