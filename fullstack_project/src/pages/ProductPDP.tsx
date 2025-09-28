import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import { api, type Product, type Category } from "@/lib/api";
import { cart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { wishlist } from "@/lib/wishlist";
import { useWishlist } from "@/wishlist/useWishlist";
import HeartButton from "@/components/common/HeartButton";

import PDPSkeleton from "@/components/skeleton/PDPskeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type Size = "S1" | "S2" | "S3";

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
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [leafCat, setLeafCat] = useState<Category | null>(null);
  const [parentCat, setParentCat] = useState<Category | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [alsoLiked, setAlsoLiked] = useState<Product[]>([]);
  const [size, setSize] = useState<Size | null>(null);
  const [added, setAdded] = useState(false);
  const [alreadyInCart, setAlreadyInCart] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const sizeBoxRef = useRef<HTMLDivElement | null>(null);

  // Heuristic: toggle to true if these products require size selection
  const productHasSizes = true; // TODO: replace with a real flag or by category check

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

        const leaf = await api.getCategory(p.category_id).catch(() => null);
        setLeafCat(leaf ?? null);

        const parent = leaf
          ? await api.parentCategoryOf(leaf.id).catch(() => null)
          : await api.parentCategoryOf(p.category_id).catch(() => null);
        setParentCat(parent ?? null);

        const sim = await api
          .productsByCategory(p.category_id, { limit: 12, excludeId: p.id })
          .catch(() => []);
        setSimilar(sim ?? []);

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
        setAdded(false);
      }
    };

    load();
  }, [id]);

  // Check if product (and selected size) is already in cart
  useEffect(() => {
    let cancelled = false;
    async function checkCart() {
      if (!user || !product) {
        setAlreadyInCart(false);
        return;
      }
      try {
        const c = await cart.get();
        const match = c.items.some(
          (it) =>
            it.product_id === product.id &&
            (productHasSizes ? (size ? it.size === size : true) : true)
        );
        if (!cancelled) setAlreadyInCart(match);
      } catch {
        if (!cancelled) setAlreadyInCart(false);
      }
    }
    checkCart();
    return () => {
      cancelled = true;
    };
  }, [user, product, size]);


  useEffect(() => {
    if (sizeError && sizeBoxRef.current) {
      sizeBoxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [sizeError]);

  
  const priceText = useMemo(
    () => (product ? `₹${product.price}` : ""),
    [product]
  );

  const onAddToBasket = async () => {
    if (!product) return;
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth", { detail: "signin" }));
      return;
    }
    if (alreadyInCart) {
      navigate("/basket");
      return;
    }
    if (productHasSizes && !size) {
      setSizeError("Please select a size to continue");
      return;
    }
    setSizeError(null);
    try {
      await cart.addItem(product.id, 1, size);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setAdded(true);
      setAlreadyInCart(true);
    } catch (e: any) {
      alert(e?.message || "Failed to add to basket");
    }
  };

  // Wishlist toggle on PDP
  const { inWishlist, refresh } = useWishlist();
  const isFaved = useMemo(
    () => (product ? inWishlist(product.id, size) : false),
    [product, size, inWishlist]
  );

  const toggleFavourite = useCallback(async () => {
    if (!product) return;
    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth", { detail: "signin" }));
      return;
    }
    try {
      if (isFaved) {
        await wishlist.remove(product.id, size ?? null);
      } else {
        await wishlist.add(product.id, size ?? null);
      }
      await refresh(); // immediate UI sync
    } catch (e: any) {
      alert(e?.message || "Failed to update favourites");
    }
  }, [product, user, isFaved, size, refresh]);

  const TopBar = (
    <div className="mb-2">
      <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />
      <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="container">
          <TextCategoryBar
            kind="level1"
            basePath="/category"
            items={staticTopTabs}
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

            {/* Sizes */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-base font-medium">Size:</div>
            </div>
            <div
              ref={sizeBoxRef}
              className={
                "mt-3 flex flex-wrap gap-3 " +
                (sizeError ? "ring-2 ring-red-500 rounded-md p-1" : "")
              }
            >
              {(["S1", "S2", "S3"] as Size[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setSizeError(null);
                  }}
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
            {sizeError && (
              <div className="mt-2 text-sm text-red-600">{sizeError}</div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={onAddToBasket}
                className={
                  "rounded-md px-6 py-4 text-center text-white " +
                  (alreadyInCart
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : added
                    ? "bg-emerald-600"
                    : "bg-amber-500 hover:bg-amber-600")
                }
              >
                {alreadyInCart
                  ? "GO TO BASKET"
                  : added
                  ? "ADDED TO BASKET"
                  : "ADD TO BASKET"}
              </button>

              <button
                className={
                  "rounded-md border px-6 py-4 text-center transition " +
                  (isFaved ? "border-red-500 text-red-600" : "")
                }
                onClick={toggleFavourite}
                title={isFaved ? "Remove from favourites" : "Add to favourites"}
              >
                <span className={isFaved ? "text-red-600" : ""}>
                  {isFaved ? "♥ Added to Favourites" : "♡ Add to Favourites"}
                </span>
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
          <div
            key={p.id}
            className="group overflow-hidden rounded-lg border bg-white transition hover:shadow-sm"
          >
            {/* Image with Heart */}
            <div className="relative">
              <Link to={`/product/${p.id}`} className="block">
                <div className="aspect-[3/4] bg-muted">
                  <img
                    src={
                      p.image_url ||
                      `https://picsum.photos/seed/${p.id}/600/800`
                    }
                    alt={p.name ?? ""}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </Link>
              {/* Optional Heart overlay on tiles */}
              <HeartButton
                productId={p.id}
                className="absolute right-2 top-2 h-8 w-8 rounded-full border-2 border-gray-300 bg-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              />
            </div>

            {/* Text */}
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-medium">{p.name}</div>
              <div className="mt-1 text-sm">₹{p.price}</div>
              {p.rating != null && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {p.rating} ★
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
