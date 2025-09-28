import { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import TextCategoryBar from "@/components/common/TextCategoryBar";
import Footer from "@/components/common/Footer";
import WishlistSkeleton from "@/components/skeleton/WishlistSkeleton";
import { wishlist, type WishlistItem } from "@/lib/wishlist";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [unauth, setUnauth] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{ productId: string | null; size: string | null }>({
    productId: null,
    size: null,
  });

  async function load() {
    setLoading(true);
    setErr(null);
    setUnauth(false);
    try {
      const data = await wishlist.get();
      setItems(data.items || []);
    } catch (e: any) {
      const msg = e?.message || "Failed to load favourites";
      setErr(msg);
      if (/unauth|401|forbidden/i.test(msg)) setUnauth(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onWishlistUpdated = () => load();
    window.addEventListener("wishlist-updated", onWishlistUpdated);
    return () => window.removeEventListener("wishlist-updated", onWishlistUpdated);
  }, []);

  useEffect(() => {
    const onAuthChanged = () => setTimeout(() => load(), 50);
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  const isEmpty = !loading && !unauth && items.length === 0;

  function openSizeModal(it: WishlistItem) {
    setModal({ productId: it.product_id, size: null });
  }

  async function confirmModal() {
    if (!modal.productId || !modal.size) {
      alert("Please pick a size");
      return;
    }
    try {
      setBusy((b) => ({ ...b, __global__: true }));
      await wishlist.moveToBasket(modal.productId, modal.size);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to move to basket");
      await load();
    } finally {
      setBusy((b) => {
        const { __global__, ...rest } = b;
        return rest;
      });
      setModal({ productId: null, size: null });
    }
  }

  async function removeItem(it: WishlistItem) {
    try {
      setBusy((b) => ({ ...b, [it.id]: true }));
      await wishlist.removeByItem(it.id);
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to remove item");
      await load();
    } finally {
      setBusy((b) => ({ ...b, [it.id]: false }));
    }
  }

  // Move to basket: if item already has size, move directly; else open modal
  async function moveToBasket(it: WishlistItem) {
    if (!it.size) {
      openSizeModal(it);
      return;
    }
    try {
      setBusy((b) => ({ ...b, [it.id]: true }));
      await wishlist.moveToBasket(it.product_id, it.size);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to move to basket");
      await load();
    } finally {
      setBusy((b) => ({ ...b, [it.id]: false }));
    }
  }

  // Replace with live categories if available
  const level1 = [
    { name: "Women", slug: "women" },
    { name: "Men", slug: "men" },
    { name: "Kids", slug: "kids" },
    { name: "Footwear", slug: "footwear" },
    { name: "Bags", slug: "bags" },
    { name: "Beauty", slug: "beauty" },
    { name: "Watches", slug: "watches" },
  ];

  return (
    <>
      <Header />

      {/* Category rail */}
      <TextCategoryBar kind="level1" basePath="/category" items={level1} />
      <div className="border-b border-zinc-200" />

      {/* Header card with right-side heart */}
      <div className="container">
        <div className="mt-4 rounded-lg bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-start justify-between px-5 py-4">
            <div>
              <h1 className="text-2xl font-semibold">Favourites</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View your most wanted products.
              </p>
            </div>
            <div className="ml-4 shrink-0 text-zinc-700">
              {/* Outline heart */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
          <div className="border-t border-zinc-100" />
        </div>

        {/* Extra gap below header card */}
        <div className="mb-8" />
      </div>

      {/* Taller main so footer sits lower on short pages */}
      <main className="container pb-12 min-h-[65svh]">
        {/* Signed-out inline banner */}
        {!loading && unauth && (
          <div className="my-8 flex flex-col items-center rounded-xl border border-yellow-300 bg-yellow-50 px-8 py-10 text-center text-yellow-900 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">Sign in to view your favourites!</h2>
            <p className="mb-6 max-w-xs text-sm text-yellow-700">
              Save and access your favourites anytime across devices.
            </p>
            <button
              className="rounded-md bg-yellow-500 px-6 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-auth", { detail: "signin" }))
              }
              type="button"
            >
              Sign in
            </button>{" "}
            to view favourites.
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <WishlistSkeleton count={12} showActions />}

        {/* Non-auth errors */}
        {!loading && !unauth && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {err}
          </div>
        )}

        {/* Empty state with extra bottom gap */}
        {!loading && isEmpty && (
          <div className="mb-12 my-8 mx-auto max-w-sm rounded-xl border border-yellow-300 bg-yellow-50 px-8 py-10 text-center text-yellow-900 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">No favourites yet</h2>
            <p className="mb-6 max-w-xs text-sm text-yellow-700">
              Save products to find them quickly later.
            </p>
            <Link
              to="/"
              className="rounded-md bg-yellow-500 px-6 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Browse products
            </Link>
          </div>
        )}

        {/* Grid for signed-in users with larger bottom gap */}
        {!loading && !unauth && items.length > 0 && (
          <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((it) => (
              <div key={it.id} className="overflow-hidden rounded-lg border bg-white">
                <Link to={`/product/${it.product_id}`} className="block">
                  <div className="aspect-[5/6] bg-muted">
                    <img
                      src={
                        it.image_url ||
                        `https://picsum.photos/seed/${it.product_id}/600/800`
                      }
                      alt={it.name ?? ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-2.5">
                  <Link to={`/product/${it.product_id}`} className="block">
                    <div className="line-clamp-1 text-[13px] font-medium">
                      {it.name}
                    </div>
                  </Link>
                  <div className="mt-0.5 text-[13px] font-semibold">₹{it.price}</div>
                  {it.size && (
                    <div className="mt-0.5 text-xs text-zinc-600">Size: {it.size}</div>
                  )}
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      className="rounded-md bg-amber-500 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                      onClick={() => moveToBasket(it)}
                      disabled={!!busy[it.id]}
                    >
                      {busy[it.id] ? "Moving..." : "Move to basket"}
                    </button>
                    <button
                      className="rounded-md border py-1.5 text-[12px] hover:bg-zinc-50 disabled:opacity-50"
                      onClick={() => removeItem(it)}
                      disabled={!!busy[it.id]}
                    >
                      {busy[it.id] ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Size selection modal */}
      {modal.productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg">
            <div className="mb-3 text-base font-semibold">Choose size</div>
            <div className="mb-4 flex gap-2">
              {["S1", "S2", "S3"].map((s) => (
                <button
                  key={s}
                  className={
                    "min-w-[48px] rounded border px-3 py-1 text-sm " +
                    (modal.size === s
                      ? "border-indigo-600 ring-2 ring-indigo-600"
                      : "hover:bg-zinc-50")
                  }
                  onClick={() => setModal((m) => ({ ...m, size: s }))}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-50"
                onClick={() => setModal({ productId: null, size: null })}
              >
                Cancel
              </button>
              <button
                className="rounded bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                disabled={!modal.size}
                onClick={confirmModal}
              >
                Add to basket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optional footer */}
      <Footer />
    </>
  );
}
