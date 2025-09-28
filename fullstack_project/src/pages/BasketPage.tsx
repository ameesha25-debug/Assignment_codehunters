import { useEffect, useMemo, useState } from "react";
import Header from "@/components/common/Header";
import TextCategoryBar, { type Item } from "@/components/common/TextCategoryBar";
import Footer from "@/components/common/Footer";
import { cart, type Cart, type CartItem } from "@/lib/cart";
import { wishlist } from "@/lib/wishlist";
import { Link, useNavigate } from "react-router-dom";

export default function BasketPage() {
  const [data, setData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [unauth, setUnauth] = useState(false);
  const navigate = useNavigate();

  // Text category items
  const categories: Item[] = [
    { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Kids", slug: "kids" },
  { name: "Footwear", slug: "footwear" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Watches", slug: "watches" },
  ];

  async function load() {
    setLoading(true);
    setErr(null);
    setUnauth(false);
    try {
      const c = await cart.get();
      setData(c);
    } catch (e: any) {
      const msg = e?.message || "Failed to load basket";
      setErr(msg);
      setData(null);
      if (/unauth|401|forbidden/i.test(msg)) setUnauth(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onCartUpdated() {
      load();
    }
    window.addEventListener("cart-updated", onCartUpdated);
    return () => window.removeEventListener("cart-updated", onCartUpdated);
  }, []);

  useEffect(() => {
    function onAuthChanged() {
      setTimeout(() => load(), 50);
    }
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  function optimisticUpdate(update: (items: CartItem[]) => CartItem[]) {
    setData((prev) => {
      if (!prev) return prev;
      const items = update(prev.items);
      const subtotal = items.reduce(
        (s, it) => s + (it.price || 0) * (it.qty || 0),
        0
      );
      return { ...prev, items, subtotal };
    });
  }

  async function onRemove(id: string) {
    try {
      optimisticUpdate((items) => items.filter((it) => it.id !== id));
      setBusy((b) => ({ ...b, [id]: true }));
      await cart.removeItem(id);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to remove item");
      await load();
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  async function onMoveToFavourites(it: CartItem) {
    try {
      setBusy((b) => ({ ...b, [it.id]: true }));
      await wishlist.add(it.product_id, it.size ?? null);
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      await cart.removeItem(it.id);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to move to favourites");
      await load();
    } finally {
      setBusy((b) => ({ ...b, [it.id]: false }));
    }
  }

  async function onClear() {
    try {
      setData((prev) => (prev ? { ...prev, items: [], subtotal: 0 } : prev));
      await cart.clear();
      window.dispatchEvent(new CustomEvent("cart-updated"));
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to clear cart");
      await load();
    }
  }

  async function onQtyChange(id: string, nextQty: number) {
    if (nextQty < 1) return;
    try {
      optimisticUpdate((items) =>
        items.map((it) => (it.id === id ? { ...it, qty: nextQty } : it))
      );
      setBusy((b) => ({ ...b, [id]: true }));
      await cart.updateQty(id, nextQty);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to update quantity");
      await load();
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  const isEmpty = !loading && !unauth && (!data || data.items.length === 0);

  const totalMRP = useMemo(() => {
    if (!data) return 0;
    return data.items.reduce(
      (sum, it) => sum + (it.price || 0) * (it.qty || 0),
      0
    );
  }, [data]);

  const offerDiscount = useMemo(() => {
    if (!data) return 0;
    let discount = 0;
    for (const it of data.items) {
      const line = (it.price || 0) * (it.qty || 0);
      if (line <= 0) continue;
      const pct = 0.05 + Math.random() * 0.05;
      const d = Math.min(Math.round(line * pct), 400);
      discount += d;
    }
    return discount;
  }, [data, totalMRP]);

  const platformFee = 20;
  const grandTotal = Math.max(0, totalMRP - offerDiscount + platformFee);

  return (
    <>
      <Header />

      {/* Text category bar (existing component) */}
      <TextCategoryBar kind="level1" items={categories} basePath="/category" />

      {/* Full-bleed subtle divider under the bar */}
      <div className="border-b border-zinc-200" />

      {/* Section header like screenshot */}
      <div className="container">
        <div className="py-5">
          <h1 className="text-2xl font-semibold">Your Shopping Basket</h1>
          <div className="mt-3 h-px w-full bg-zinc-300" />
        </div>
      </div>

      <main className="container pb-10">
        <div className="mb-4 text-sm text-zinc-700">
          {data?.items?.length ? `${data.items.length} Products` : ""}
        </div>

         {/* Signed-out inline banner */}
        {!loading && unauth && (
          <div className="my-8 flex flex-col items-center rounded-xl border border-yellow-300 bg-yellow-50 px-8 py-10 text-center text-yellow-900 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">
              Sign in to view your basket!
            </h2>
            <p className="mb-6 max-w-xs text-sm text-yellow-700">
              Save and access your basket anytime across devices.
            </p>
            <button
              className="rounded-md bg-yellow-500 px-6 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-auth", { detail: "signin" })
                )
              }
              type="button"
            >
              Sign In
            </button>
          </div>
        )}

        {loading && <div className="text-sm text-zinc-600">Loading…</div>}

        {!loading && !unauth && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {err}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="my-8 mx-auto mb-12 max-w-sm rounded-xl border border-yellow-300 bg-yellow-50 px-8 py-10 text-center text-yellow-900 shadow-md">
            <div className="mb-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-20 w-20 text-yellow-700"
                fill="none"
                viewBox="0 0 40 40"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <rect x="10" y="12" width="20" height="13" rx="2" />
                <line x1="10" y1="12" x2="8" y2="7" />
                <line x1="10" y1="12" x2="30" y2="12" />
                <line x1="10" y1="25" x2="30" y2="25" />
                <line x1="16" y1="12" x2="16" y2="25" />
                <line x1="24" y1="12" x2="24" y2="25" />
                <circle cx="14" cy="29" r="2.3" />
                <circle cx="26" cy="29" r="2.3" />
              </svg>
            </div>

            <h2 className="mb-2 text-xl font-semibold">Your basket is empty</h2>
            <p className="mb-6 max-w-xs text-yellow-700 text-sm">
              Discover amazing products and start adding to your basket today.
            </p>
            <Link
              to="/"
              className="rounded-md bg-yellow-500 px-6 py-2 font-semibold text-white shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {!loading && !unauth && data && data.items.length > 0 && (
          <div className="grid grid-cols-12 gap-6">
            {/* Items */}
            <div className="col-span-12 space-y-4 lg:col-span-8">
              {data.items.map((it) => {
                const lineTotal = (it.price || 0) * (it.qty || 0);
                const isBusyItem = !!busy[it.id];
                const minQty = 1;
                const maxQty = 10;

                return (
                  <div key={it.id} className="rounded border bg-white p-3">
                    <div className="flex gap-4">
                      <img
                        src={
                          it.image_url ||
                          `https://picsum.photos/seed/${it.product_id}/160/200`
                        }
                        className="h-28 w-24 rounded object-cover"
                        alt={it.name}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold">
                              {it.name}
                            </div>
                            <div className="mt-1 text-sm text-zinc-700">
                              ₹{it.price}
                            </div>
                            <div className="mt-1 text-sm text-zinc-600">
                              {it.size ? <>Size: {it.size}</> : null}
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-sm text-zinc-700">Qty:</span>
                              <div className="inline-flex items-center rounded-md border bg-white">
                                <button
                                  aria-label="Decrease quantity"
                                  className="h-8 w-8 rounded-l-md text-lg leading-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
                                  disabled={
                                    isBusyItem || (it.qty || 1) <= minQty
                                  }
                                  onClick={() =>
                                    onQtyChange(
                                      it.id,
                                      Math.max(minQty, (it.qty || 1) - 1)
                                    )
                                  }
                                >
                                  −
                                </button>
                                <div className="select-none px-3 text-sm tabular-nums">
                                  {it.qty}
                                </div>
                                <button
                                  aria-label="Increase quantity"
                                  className="h-8 w-8 rounded-r-md text-lg leading-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
                                  disabled={
                                    isBusyItem || (it.qty || 1) >= maxQty
                                  }
                                  onClick={() =>
                                    onQtyChange(
                                      it.id,
                                      Math.min(maxQty, (it.qty || 1) + 1)
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-semibold">
                              ₹{lineTotal}
                            </div>
                          </div>
                        </div>

                        {/* Bottom action row */}
                        <div className="mt-3 border-t-[1px] border-white pt-3">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              className="w-full rounded-md border px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              disabled={isBusyItem}
                              onClick={() => onRemove(it.id)}
                            >
                              Remove
                            </button>
                            <button
                              className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                              disabled={isBusyItem}
                              onClick={() => onMoveToFavourites(it)}
                            >
                              Move to favourites
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Summary */}
            <div className="col-span-12 lg:col-span-4">
              <div className="rounded border bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700">Total MRP</span>
                  <span className="font-medium">₹{totalMRP}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-700">Offer discount</span>
                  <span className="font-medium text-emerald-600">
                    - ₹{offerDiscount}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-700">Shipping fee</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-700">Platform fee</span>
                  <span className="font-medium">₹20</span>
                </div>

                <div className="my-3 h-px bg-zinc-200" />

                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>

                <button
                  className="mt-4 w-full rounded bg-amber-500 py-2 font-semibold text-white hover:bg-amber-600"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout now
                </button>

                <button
                  className="mt-2 w-full rounded border px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={onClear}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Site footer (existing common component) */}
      <Footer />
    </>
  );
}
