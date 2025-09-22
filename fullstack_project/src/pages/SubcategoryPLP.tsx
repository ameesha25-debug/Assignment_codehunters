// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { api, type Category, type Product } from "../lib/api";
// import TextCategoryBar from "../components/common/TextCategoryBar";

// export default function SubcategoryPLP() {
// const { parentSlug, subSlug } =
// useParams<{ parentSlug: string; subSlug: string }>();

// const [parent, setParent] = useState<Category | null>(null);
// const [subcategory, setSubcategory] = useState<Category | null>(null);
// const [siblings, setSiblings] = useState<Category[]>([]);
// const [products, setProducts] = useState<Product[]>([]);
// const [error, setError] = useState<string | null>(null);
// const [loading, setLoading] = useState(true);

// useEffect(() => {
// if (!parentSlug || !subSlug) return;
// setLoading(true);
// setError(null);
// api
// .subcategoryPage(parentSlug, subSlug)
// .then(({ parent, subcategory, siblings, products }) => {
// setParent(parent);
// setSubcategory(subcategory);
// setSiblings(siblings);
// setProducts(products);
// })
// .catch((e) => setError(e.message))
// .finally(() => setLoading(false));
// }, [parentSlug, subSlug]);

// if (loading) return <p className="p-4">Loading…</p>;
// if (error || !parent || !subcategory)
// return <p className="p-4 text-red-600">{error ?? "Not found"}</p>;

// return (
// <main className="mx-auto max-w-7xl px-4">
// {/* Breadcrumb */}
// <nav className="flex items-center gap-2 text-sm my-4" aria-label="Breadcrumb">
// <Link to="/" className="text-indigo-600 hover:underline">Home</Link>
// <span aria-hidden>›</span>
// <Link to={`/category/${parent.slug}`} className="text-indigo-600 hover:underline">
// {parent.name}
// </Link>
// <span aria-hidden>›</span>
// <span className="text-gray-900">{subcategory.name}</span>
// </nav>
//   {/* Siblings under the same parent */}
//   <TextCategoryBar
//     kind="level2"
//     parentSlug={parent.slug}
//     items={siblings.map((s) => ({ name: s.name, slug: s.slug }))}
//     activeSlug={subcategory.slug}
//   />

//   {/* Header */}
//   <div className="flex items-center justify-between mb-3">
//     <h1 className="text-xl font-semibold">{subcategory.name}</h1>
//     <div className="text-sm text-gray-500">{products.length} items</div>
//   </div>

//   {/* Product grid */}
//   <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//     {products.map((p) => {
//       const displayImage =
//         (p as any).image_url ??
//         (p as any).image ??
//         `https://picsum.photos/seed/${p.id}/600/800`;
//       console.log(
//         "subcard img ->",
//         displayImage,
//         "title ->",
//         (p as any).name ?? (p as any).title
//       );
//       return (
//         <article key={p.id} className="border rounded-md p-3">
//           <div className="aspect-[3/4] bg-gray-50 rounded mb-2 overflow-hidden">
//             <img
//               src={displayImage}
//               alt={(p as any).name ?? (p as any).title ?? ""}
//               className="h-full w-full object-cover"
//               loading="lazy"
//             />
//           </div>
//           <div className="text-sm font-medium">
//             {(p as any).name ?? (p as any).title}
//           </div>
//           <div className="text-sm text-gray-600">₹{p.price}</div>
//         </article>
//       );
//     })}
//   </section>
// </main>
// );
// }


import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Category, type Product } from "@/lib/api";

export default function SubcategoryPLP() {
  const { parentSlug, subSlug } = useParams<{ parentSlug: string; subSlug: string }>();

  const [parent, setParent] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Category | null>(null);
  const [siblings, setSiblings] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    if (!parentSlug || !subSlug) return;
    setLoading(true);
    setError(null);
    api
      .subcategoryPage(parentSlug, subSlug)
      .then(({ parent, subcategory, siblings, products }) => {
        setParent(parent);
        setSubcategory(subcategory);
        setSiblings(siblings);
        setProducts(products);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [parentSlug, subSlug]);

  return (
    <>
      <Header />

      {parent && siblings.length > 0 && (
        <div className="mb-2">
          <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
          <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="container">
              <TextCategoryBar
                kind="level1"
                items={siblings.map((s) => ({ name: s.name, slug: s.slug }))}
                activeSlug={subcategory?.slug}
              />
            </div>
          </div>
        </div>
      )}

      <main className="container">
        {/* Header strip */}
        <div className="mb-2 grid grid-cols-12 gap-6">
          {/* Left: FILTERS title */}
          <div className="col-span-12 md:col-span-3">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide text-foreground">FILTERS</h2>
              <button className="text-xs text-indigo-600 hover:underline">Clear all</button>
            </div>
          </div>

          {/* Right: breadcrumbs + count/sort */}
          <div className="col-span-12 md:col-span-9">
            <nav className="mb-2 text-sm text-gray-500" aria-label="Breadcrumb">
              <Link to="/" className="text-gray-500 hover:text-yellow-500 hover:underline">Home</Link>
              {parent && (
                <>
                  <span className="mx-2">›</span>
                  <Link to={`/category/${parent.slug}`} className="text-gray-500 hover:text-yellow-500 hover:underline">
                    {parent.name}
                  </Link>
                </>
              )}
              {subcategory && (
                <>
                  <span className="mx-2">›</span>
                  <span className="text-gray-500">{subcategory.name}</span>
                </>
              )}
            </nav>

            {!loading && (
              <div className="mb-0 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Products for {subcategory?.name ?? "Subcategory"}: {products.length} available
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
              {/* Add your filter blocks here similar to CategoryPLP */}
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
            </div>
          </aside>

          <div className="col-span-12 md:col-span-9">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {loading && <p className="text-sm text-muted-foreground">Loading products…</p>}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products
                .filter((p) => !!p?.id)
                .map((p) => {
                  const title = (p as any).name ?? (p as any).title ?? "";
                  const img =
                    (p as any).image_url ??
                    (p as any).image ??
                    `https://picsum.photos/seed/${p.id}/600/800`;

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

            {!loading && products.length === 0 && (
              <p className="mt-6 text-sm text-muted-foreground">No products found in this subcategory.</p>
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
