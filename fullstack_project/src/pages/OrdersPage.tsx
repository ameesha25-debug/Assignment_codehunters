
'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import { fetchMyOrders, type OrderRow } from '@/lib/ordersClient';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const [list, setList] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [unauth, setUnauth] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    setUnauth(false);
    try {
      const rows = await fetchMyOrders();
      setList(rows);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load orders';
      setErr(msg);
      if (/unauth|401|forbidden/i.test(msg)) setUnauth(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Refetch immediately after login/order success
  useEffect(() => {
    function onAuthChanged() {
      setTimeout(() => load(), 50);
    }
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  return (
    <>
      <Header />
      <main className="container py-6">
        <h1 className="text-xl font-semibold mb-4">My Orders</h1>

        {!loading && unauth && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Not signed in. <button className="underline" onClick={() => window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }))}>Sign in</button> to view orders.
          </div>
        )}

        {loading && <div className="text-sm text-zinc-600">Loading…</div>}

        {!loading && !unauth && err && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{err}</div>
        )}

        {!loading && !unauth && !err && list.length === 0 && (
          <div className="rounded border bg-white p-6 text-center text-sm">
            No orders yet. <Link className="underline text-amber-600" to="/">Continue shopping</Link>
          </div>
        )}

        {!loading && !unauth && !err && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((o) => (
              <li key={o.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-sm text-zinc-600">{new Date(o.created_at).toLocaleString()}</div>
                </div>

                {!!o.items?.length && (
                  <div className="mt-3 flex items-center gap-2">
                    {o.items.slice(0, 3).map((it, idx) => (
                      <img
                        key={idx}
                        src={it.image || `https://picsum.photos/seed/${o.id}-${idx}/80/96`}
                        alt={it.name}
                        className="w-16 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-1 text-sm">Status: {o.status} • Payment: {o.payment_method} • Items: {o.item_count}</div>
                <div className="mt-1 text-sm font-semibold">Total: ₹{o.amount}</div>

                <div className="mt-3 text-right">
                  <Link to={`/orders/${o.id}`} className="text-amber-600 underline">View details</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
