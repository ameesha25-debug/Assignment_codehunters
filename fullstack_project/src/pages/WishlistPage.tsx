import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import { wishlist, type WishlistItem } from '@/lib/wishlist';
import { Link } from 'react-router-dom';

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
      const msg = e?.message || 'Failed to load favourites';
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
    function onWishlistUpdated() {
      load();
    }
    window.addEventListener('wishlist-updated', onWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', onWishlistUpdated);
  }, []);

  useEffect(() => {
    function onAuthChanged() {
      setTimeout(() => load(), 50);
    }
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  const isEmpty = !loading && !unauth && items.length === 0;

  function openSizeModal(it: WishlistItem) {
    setModal({ productId: it.product_id, size: null });
  }

  async function confirmModal() {
    if (!modal.productId || !modal.size) {
      alert('Please pick a size');
      return;
    }
    try {
      setBusy((b) => ({ ...b, __global__: true }));
      await wishlist.moveToBasket(modal.productId, modal.size);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to move to basket');
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
        </div>

        {!loading && unauth && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Not signed in{' '}
            <button
              className="underline"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }))
              }
            >
              Sign in
            </button>{' '}
            to view favourites.
          </div>
        )}

        {loading && <div className="text-sm text-zinc-600">Loading…</div>}

        {!loading && !unauth && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {err}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="rounded border bg-white p-8 text-center">
            <div className="text-lg font-semibold text-zinc-800">No favourites yet</div>
            <div className="mt-2 text-zinc-600">Save products to find them quickly later.</div>
            <Link
              to="/"
              className="mt-4 inline-block rounded-md bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            >
              Browse products
            </Link>
          </div>
        )}

        {!loading && !unauth && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((it) => {
              const isRowBusy = !!busy[it.id] || !!busy.__global__;

              return (
                <div key={it.id} className="overflow-hidden rounded-lg border bg-white">
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

                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        className="rounded-md bg-amber-500 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                        onClick={() => openSizeModal(it)}
                        disabled={isRowBusy}
                      >
                        Move to basket
                      </button>
                      <button
                        className="rounded-md border py-1.5 text-[12px] hover:bg-zinc-50 disabled:opacity-50"
                        onClick={() => removeItem(it)}
                        disabled={isRowBusy}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Size selection modal */}
      {modal.productId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg">
            <div className="mb-3 text-base font-semibold">Choose size</div>
            <div className="mb-4 flex gap-2">
              {['S1', 'S2', 'S3'].map((s) => (
                <button
                  key={s}
                  className={
                    'min-w-[48px] rounded border px-3 py-1 text-sm ' +
                    (modal.size === s ? 'border-indigo-600 ring-2 ring-indigo-600' : 'hover:bg-zinc-50')
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
    </>
  );
}
