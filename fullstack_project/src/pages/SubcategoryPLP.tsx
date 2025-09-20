import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type Category, type Product } from "../lib/api";
import TextCategoryBar from "../components/common/TextCategoryBar";

export default function SubcategoryPLP() {
const { parentSlug, subSlug } =
useParams<{ parentSlug: string; subSlug: string }>();

const [parent, setParent] = useState<Category | null>(null);
const [subcategory, setSubcategory] = useState<Category | null>(null);
const [siblings, setSiblings] = useState<Category[]>([]);
const [products, setProducts] = useState<Product[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

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

if (loading) return <p className="p-4">Loading…</p>;
if (error || !parent || !subcategory)
return <p className="p-4 text-red-600">{error ?? "Not found"}</p>;

return (
<main className="mx-auto max-w-7xl px-4">
{/* Breadcrumb */}
<nav className="flex items-center gap-2 text-sm my-4" aria-label="Breadcrumb">
<Link to="/" className="text-indigo-600 hover:underline">Home</Link>
<span aria-hidden>›</span>
<Link to={`/category/${parent.slug}`} className="text-indigo-600 hover:underline">
{parent.name}
</Link>
<span aria-hidden>›</span>
<span className="text-gray-900">{subcategory.name}</span>
</nav>
  {/* Siblings under the same parent */}
  <TextCategoryBar
    kind="level2"
    parentSlug={parent.slug}
    items={siblings.map((s) => ({ name: s.name, slug: s.slug }))}
    activeSlug={subcategory.slug}
  />

  {/* Header */}
  <div className="flex items-center justify-between mb-3">
    <h1 className="text-xl font-semibold">{subcategory.name}</h1>
    <div className="text-sm text-gray-500">{products.length} items</div>
  </div>

  {/* Product grid */}
  <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {products.map((p) => {
      const displayImage =
        (p as any).image_url ??
        (p as any).image ??
        `https://picsum.photos/seed/${p.id}/600/800`;
      console.log(
        "subcard img ->",
        displayImage,
        "title ->",
        (p as any).name ?? (p as any).title
      );
      return (
        <article key={p.id} className="border rounded-md p-3">
          <div className="aspect-[3/4] bg-gray-50 rounded mb-2 overflow-hidden">
            <img
              src={displayImage}
              alt={(p as any).name ?? (p as any).title ?? ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="text-sm font-medium">
            {(p as any).name ?? (p as any).title}
          </div>
          <div className="text-sm text-gray-600">₹{p.price}</div>
        </article>
      );
    })}
  </section>
</main>
);
}