// src/pages/WishlistPage.tsx
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/common/Header';
import { wishlist, type WishlistItem } from '@/lib/wishlist';
import { cart } from '@/lib/cart';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await wishlist.get();
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load favourites');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onWishlistUpdated() {
      load();
    }
    window.addEventListener('wishlist-updated', onWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', onWishlistUpdated);
  }, []);

  const isEmpty = !loading && items.length === 0;

  async function moveToBasket(it: WishlistItem) {
    try {
      setBusy((b) => ({ ...b, [it.id]: true }));
      await cart.addItem(it.product_id, 1, it.size ?? null);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      await wishlist.removeByItem(it.id);
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to move to basket');
      await load();
    } finally {
      setBusy((b) => ({ ...b, [it.id]: false }));
    }
  }

  async function removeItem(it: WishlistItem) {
    try {
      setBusy((b) => ({ ...b, [it.id]: true }));
      await wishlist.removeByItem(it.id);
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to remove item');
      await load();
    } finally {
      setBusy((b) => ({ ...b, [it.id]: false }));
    }
  }

  return (
    <>
      <Header />
      <main className="container py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Favourites</h1>
          {/* MRP total removed for a cleaner header */}
        </div>

        {loading && <div className="text-sm text-zinc-600">Loading…</div>}

        {!loading && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {err.includes('Unauthorized') ? (
              <>
                Not signed in.{` `}
                <button
                  className="underline"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }))
                  }
                >
                  Sign in
                </button>{' '}
                to view favourites.
              </>
            ) : (
              err
            )}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="rounded border bg-white p-8 text-center">
            <div className="text-lg font-semibold text-zinc-800">No favourites yet</div>
            <div className="mt-2 text-zinc-600">Save products to find them quickly later.</div>
            <Link
              to="/"
              className="mt-4 inline-block rounded-md bg-amber-500 px-4 py-2 text-white font-semibold hover:bg-amber-600"
            >
              Browse products
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg border bg-white overflow-hidden">
                <Link to={`/product/${it.product_id}`} className="block">
                  <div className="aspect-[5/6] bg-muted">
                    <img
                      src={it.image_url || `https://picsum.photos/seed/${it.product_id}/600/800`}
                      alt={it.name ?? ''}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-2.5">
                  <Link to={`/product/${it.product_id}`} className="block">
                    <div className="line-clamp-1 text-[13px] font-medium">{it.name}</div>
                  </Link>
                  <div className="mt-0.5 text-[13px] font-semibold">₹{it.price}</div>
                  {it.size && (
                    <div className="mt-0.5 text-xs text-zinc-600">
                      Size: {it.size}
                    </div>
                  )}

                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      className="rounded-md bg-amber-500 text-white py-1.5 text-[12px] font-semibold hover:bg-amber-600 disabled:opacity-50"
                      onClick={() => moveToBasket(it)}
                      disabled={!!busy[it.id]}
                    >
                      Move to basket
                    </button>
                    <button
                      className="rounded-md border py-1.5 text-[12px] hover:bg-zinc-50 disabled:opacity-50"
                      onClick={() => removeItem(it)}
                      disabled={!!busy[it.id]}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
