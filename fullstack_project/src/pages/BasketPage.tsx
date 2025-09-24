// // src/pages/BasketPage.tsx
// import { useEffect, useState } from 'react';
// import Header from '@/components/common/Header';
// import { cart, type Cart } from '@/lib/cart';
// import { Link, useNavigate } from 'react-router-dom';

// export default function BasketPage() {
//   const [data, setData] = useState<Cart | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState<string | null>(null);
//   const navigate = useNavigate();

//   async function load() {
//     setLoading(true);
//     setErr(null);
//     try {
//       const c = await cart.get();
//       setData(c);
//     } catch (e: any) {
//       // 401 means not signed in; show prompt
//       setErr(e?.message || 'Failed to load basket');
//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   // Keep this page in sync if cart is updated elsewhere (e.g., grid/PDP)
//   useEffect(() => {
//     function onCartUpdated() {
//       load();
//     }
//     window.addEventListener('cart-updated', onCartUpdated);
//     return () => window.removeEventListener('cart-updated', onCartUpdated);
//   }, []);

//   async function onRemove(id: string) {
//     try {
//       // Optimistic UI update
//       setData((prev) => {
//         if (!prev) return prev;
//         const items = prev.items.filter((it) => it.id !== id);
//         const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
//         return { ...prev, items, subtotal };
//       });

//       await cart.removeItem(id);
//       window.dispatchEvent(new CustomEvent('cart-updated')); // notify header and any listeners

//       // Confirm with server data
//       await load();
//     } catch (e: any) {
//       alert(e?.message || 'Failed to remove item');
//       await load(); // restore accurate state on error
//     }
//   }

//   const isEmpty = !loading && (!data || data.items.length === 0);

//   return (
//     <>
//       <Header />
//       <main className="container py-6">
//         <h1 className="text-xl font-semibold mb-4">Basket</h1>

//         {loading && <div className="text-sm text-zinc-600">Loading…</div>}

//         {!loading && err && (
//           <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
//             {err.includes('Unauthorized') ? (
//               <>
//                 Not signed in.{` `}
//                 <button
//                   className="underline"
//                   onClick={() =>
//                     window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }))
//                   }
//                 >
//                   Sign in
//                 </button>{' '}
//                 to view the basket.
//               </>
//             ) : (
//               err
//             )}
//           </div>
//         )}

//         {!loading && isEmpty && (
//           <div className="rounded border bg-white p-6 text-center">
//             <div className="text-zinc-700 mb-2">Basket is empty.</div>
//             <Link
//               to="/"
//               className="inline-block rounded-md bg-amber-500 px-4 py-2 text-white font-semibold hover:bg-amber-600"
//             >
//               Continue shopping
//             </Link>
//           </div>
//         )}

//         {!loading && data && data.items.length > 0 && (
//           <div className="grid grid-cols-12 gap-6">
//             <div className="col-span-12 lg:col-span-8 space-y-4">
//               {data.items.map((it) => (
//                 <div key={it.id} className="flex gap-4 rounded border p-3 bg-white">
//                   <img
//                     src={it.image_url || `https://picsum.photos/seed/${it.product_id}/120/160`}
//                     className="w-20 h-24 object-cover rounded"
//                     alt={it.name}
//                   />
//                   <div className="flex-1">
//                     <div className="font-medium">{it.name}</div>
//                     <div className="text-sm text-zinc-600">
//                       ₹{it.price} · Qty {it.qty}
//                       {it.size ? ` · ${it.size}` : ''}
//                     </div>
//                     <div className="mt-2 flex gap-3">
//                       <button
//                         className="text-sm text-red-600 underline"
//                         onClick={() => onRemove(it.id)}
//                       >
//                         Remove
//                       </button>
//                       <Link to={`/product/${it.product_id}`} className="text-sm text-zinc-700 underline">
//                         View product
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="col-span-12 lg:col-span-4">
//               <div className="rounded border bg-white p-4">
//                 <div className="flex justify-between text-sm">
//                   <span>Subtotal</span>
//                   <span>₹{data.subtotal}</span>
//                 </div>
//                 <div className="mt-1 text-xs text-zinc-600">Shipping calculated at checkout</div>
//                 <button
//                   className="mt-4 w-full rounded bg-amber-500 text-white py-2 font-semibold hover:bg-amber-600"
//                   onClick={() => navigate('/checkout')}
//                 >
//                   Checkout now
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </>
//   );
// }
// src/pages/BasketPage.tsx
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/common/Header';
import { cart, type Cart, type CartItem } from '@/lib/cart';
import { Link, useNavigate } from 'react-router-dom';

type QtyOption = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const QTY_OPTIONS: QtyOption[] = [1, 2, 3, 4, 5, 6, 7, 8];

export default function BasketPage() {
  const [data, setData] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const c = await cart.get();
      setData(c);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load basket');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Keep page in sync if cart is changed elsewhere
  useEffect(() => {
    function onCartUpdated() {
      load();
    }
    window.addEventListener('cart-updated', onCartUpdated);
    return () => window.removeEventListener('cart-updated', onCartUpdated);
  }, []);

  const subtotalText = useMemo(
    () => (data ? `₹${data.subtotal}` : '₹0'),
    [data]
  );

  function optimisticUpdate(update: (items: CartItem[]) => CartItem[]) {
    setData((prev) => {
      if (!prev) return prev;
      const items = update(prev.items);
      const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
      return { ...prev, items, subtotal };
    });
  }

  async function onRemove(id: string) {
    try {
      optimisticUpdate((items) => items.filter((it) => it.id !== id));
      setBusy((b) => ({ ...b, [id]: true }));
      await cart.removeItem(id);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to remove item');
      await load();
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
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
      window.dispatchEvent(new CustomEvent('cart-updated'));
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update quantity');
      await load();
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  const isEmpty = !loading && (!data || data.items.length === 0);

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-xl font-semibold mb-4">Basket</h1>

        {loading && <div className="text-sm text-zinc-600">Loading…</div>}

        {!loading && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {err.includes('Unauthorized') ? (
              <>
                Not signed in.{' '}
                <button
                  className="underline"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }))
                  }
                >
                  Sign in
                </button>{' '}
                to view the basket.
              </>
            ) : (
              err
            )}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="rounded border bg-white p-6 text-center">
            <div className="text-zinc-700 mb-2">Basket is empty.</div>
            <Link
              to="/"
              className="inline-block rounded-md bg-amber-500 px-4 py-2 text-white font-semibold hover:bg-amber-600"
            >
              Continue shopping
            </Link>
          </div>
        )}

        {!loading && data && data.items.length > 0 && (
          <div className="grid grid-cols-12 gap-6">
            {/* Items */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {data.items.map((it) => {
                const lineTotal = (it.price || 0) * (it.qty || 0);
                const isBusy = !!busy[it.id];
                return (
                  <div key={it.id} className="rounded border bg-white p-3">
                    <div className="flex gap-4">
                      <img
                        src={it.image_url || `https://picsum.photos/seed/${it.product_id}/160/200`}
                        className="w-24 h-28 object-cover rounded"
                        alt={it.name}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold">{it.name}</div>
                            <div className="mt-1 text-sm text-zinc-700">₹{it.price}</div>
                            <div className="mt-1 text-sm text-zinc-600">
                              {it.size ? <>Size: {it.size}</> : null}
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              {/* Qty selector */}
                              <label className="text-sm text-zinc-700">Qty:</label>
                              <div className="flex items-center rounded border">
                                <button
                                  className="px-2 py-1 text-sm disabled:opacity-50"
                                  disabled={isBusy || it.qty <= 1}
                                  onClick={() => onQtyChange(it.id, (it.qty || 1) - 1)}
                                >
                                  −
                                </button>
                                <select
                                  className="px-2 py-1 text-sm outline-none"
                                  value={it.qty}
                                  disabled={isBusy}
                                  onChange={(e) => onQtyChange(it.id, Number(e.target.value))}
                                >
                                  {QTY_OPTIONS.map((q) => (
                                    <option key={q} value={q}>
                                      {q}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="px-2 py-1 text-sm disabled:opacity-50"
                                  disabled={isBusy || it.qty >= 8}
                                  onClick={() => onQtyChange(it.id, (it.qty || 1) + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold">₹{lineTotal}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <button
                            className="text-red-600 underline disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => onRemove(it.id)}
                          >
                            Remove
                          </button>
                          <Link
                            to={`/product/${it.product_id}`}
                            className="text-zinc-700 underline"
                          >
                            View product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="col-span-12 lg:col-span-4">
              <div className="rounded border bg-white p-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{subtotalText}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-600">Shipping calculated at checkout</div>
                <button
                  className="mt-4 w-full rounded bg-amber-500 text-white py-2 font-semibold hover:bg-amber-600"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
