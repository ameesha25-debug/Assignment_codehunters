import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Product, type Category } from "@/lib/api";

import PDPSkeleton from "@/components/skeleton/PDPskeleton";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type Size = "S1" | "S2" | "S3";

// Static parent tabs used across PLP & PDP
const staticTopTabs = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Kids", slug: "kids" },
  { name: "Footwear", slug: "footwear" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Watches", slug: "watches" },
];

export default function ProductPDP() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [leafCat, setLeafCat] = useState<Category | null>(null); // product's category
  const [parentCat, setParentCat] = useState<Category | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [alsoLiked, setAlsoLiked] = useState<Product[]>([]);
  const [size, setSize] = useState<Size | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!id || !uuidRe.test(id)) {
        setErr("Invalid product id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const p = await api.productById(id);
        if (!p) {
          setErr("Product not found");
          return;
        }
        setProduct(p);

        // Resolve leaf and parent categories
        const leaf = await api.getCategory(p.category_id).catch(() => null);
        setLeafCat(leaf ?? null);

        const parent = leaf
          ? await api.parentCategoryOf(leaf.id).catch(() => null)
          : await api.parentCategoryOf(p.category_id).catch(() => null);
        setParentCat(parent ?? null);

        // Similar within leaf
        const sim = await api
          .productsByCategory(p.category_id, { limit: 12, excludeId: p.id })
          .catch(() => []);
        setSimilar(sim ?? []);

        // Also liked from parent (if present)
        if (parent?.id) {
          const liked = await api
            .productsByCategory(parent.id, { limit: 12, excludeId: p.id })
            .catch(() => []);
          setAlsoLiked(liked ?? []);
        } else {
          setAlsoLiked([]);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const priceText = useMemo(
    () => (product ? `₹${product.price}` : ""),
    [product]
  );

  const onAddToBasket = () => {
    if (!product) return;
    alert("Added to basket");
  };

  const onAddToFavourites = () => {
    if (!product) return;
    alert("Added to favourites");
  };

  // Common top bar component
  const TopBar = (
    <div className="mb-2">
      <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
      <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="container">
          <TextCategoryBar
            kind="level1"
            basePath="/category"
            items={staticTopTabs}
            // highlight parent if available, else leaf
            activeSlug={parentCat?.slug ?? leafCat?.slug}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        {TopBar}
        <PDPSkeleton />
      </>
    );
  }

  if (err || !product) {
    return (
      <>
        <Header />
        {TopBar}
        <main className="container">
          <div className="py-10 text-sm text-red-600">
            {err ?? "Product not found"}
          </div>
          <button
            className="mt-3 rounded border px-3 py-2 text-sm"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </main>
      </>
    );
  }

  // Breadcrumb logic:
  // - Single-level categories (beauty/bags/watches): Home › Category › Product
  // - Two-level categories: Home › Parent › Subcategory › Product
  const hasParentDepth = !!(
    parentCat &&
    leafCat &&
    parentCat.id !== leafCat.id
  );
  const topForUI = parentCat ?? leafCat ?? null;

  return (
    <>
      <Header />
      {TopBar}

      <main className="container">
        {/* Breadcrumbs */}
        <nav className="mb-3 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link
            to="/"
            className="text-gray-500 hover:text-yellow-500 hover:underline"
          >
            Home
          </Link>

          {topForUI && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/category/${topForUI.slug}`}
                className="text-gray-500 hover:text-yellow-500 hover:underline"
              >
                {topForUI.name}
              </Link>
            </>
          )}

          {hasParentDepth && parentCat && leafCat && (
            <>
              <span className="mx-2">›</span>
              <Link
                to={`/category/${parentCat.slug}/${leafCat.slug}`}
                className="text-gray-500 hover:text-yellow-500 hover:underline"
              >
                {leafCat.name}
              </Link>
            </>
          )}

          <span className="mx-2">›</span>
          <span className="text-gray-500">{product.name}</span>
        </nav>

        {/* PDP content */}
        <section className="grid grid-cols-12 gap-8">
          {/* Left image */}
          <div className="col-span-12 md:col-span-6">
            <div className="overflow-hidden rounded-lg border bg-white">
              <div
                className="
                  w-full bg-muted flex items-center justify-center
                  h-[440px] md:h-[500px] lg:h-[540px]
                "
                style={{ maxHeight: "81vh" }}
              >
                <img
                  src={
                    product.image_url ||
                    `https://picsum.photos/seed/${product.id}/900/1200`
                  }
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right details */}
          <div className="col-span-12 md:col-span-6">
            <h1 className="text-2xl font-semibold">{product.name}</h1>

            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {product.rating != null && <span>{product.rating} ★</span>}
              {product.review_count != null && (
                <span>{product.review_count} reviews</span>
              )}
              {product.badge && (
                <span className="rounded-full border px-2 py-0.5 text-xs">
                  {product.badge}
                </span>
              )}
            </div>

            <div className="mt-4 text-2xl font-semibold">{priceText}</div>

            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div className="text-indigo-700">Free shipping on all orders</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Earn 1 Point</span>
                <span className="text-xs">ⓘ</span>
              </div>
            </div>

            <div className="mt-5 rounded-lg border bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span>🏷️</span>
                <h2 className="text-base font-semibold">Offers & Discounts</h2>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-semibold">Shop more, Save More</div>
                <div className="mt-1 text-sm">
                  Extra Rs.400 off on orders above 1999. Code MAX400
                </div>
              </div>
            </div>

            {/* Sizes (optional) */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-base font-medium">Size:</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {(["S1", "S2", "S3"] as Size[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={
                    "min-w-[64px] rounded-md border px-6 py-3 text-sm " +
                    (size === s
                      ? "border-indigo-600 ring-2 ring-indigo-600"
                      : "hover:bg-muted")
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={onAddToBasket}
                className="rounded-md bg-amber-500 px-6 py-4 text-center text-white"
              >
                ADD TO BASKET
              </button>
              <button
                className="rounded-md border px-6 py-4 text-center"
                onClick={onAddToFavourites}
              >
                ♡ Add to Favourites
              </button>
            </div>
          </div>
        </section>

        {/* Similar Products */}
        <Accordion
          type="single"
          collapsible
          defaultValue={undefined}
          className="mt-8"
        >
          <AccordionItem value="similar">
            <AccordionTrigger className="text-lg font-semibold">
              Similar Products
            </AccordionTrigger>
            <AccordionContent>
              <ProductsCarousel items={similar} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Customers Also Liked */}
        {parentCat && (
          <Accordion
            type="single"
            collapsible
            defaultValue="also-liked"
            className="mt-4"
          >
            <AccordionItem value="also-liked">
              <AccordionTrigger className="text-lg font-semibold">
                Customers Also Liked
              </AccordionTrigger>
              <AccordionContent>
                <ProductsCarousel items={alsoLiked} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </main>
    </>
  );
}

/* --------- Supporting UI --------- */

function ProductsCarousel({ items }: { items: Product[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No items available.</div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items
        .filter((p) => !!p?.id)
        .map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="group overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
          >
            <div className="aspect-[3/4] bg-muted">
              <img
                src={
                  p.image_url || `https://picsum.photos/seed/${p.id}/600/800`
                }
                alt={p.name ?? ""}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-medium">{p.name}</div>
              <div className="mt-1 text-sm">₹{p.price}</div>
              {p.rating != null && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {p.rating} ★
                </div>
              )}
            </div>
          </Link>
        ))}
    </div>
  );
}
