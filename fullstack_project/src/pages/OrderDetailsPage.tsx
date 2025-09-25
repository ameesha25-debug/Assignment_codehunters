'use client';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import { fetchOrderDetails, type OrderDetails } from '@/lib/ordersClient';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [o, setO] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const d = await fetchOrderDetails(id!);
        if (on) setO(d);
      } catch (e: any) {
        if (on) setErr(e?.message || 'Failed to load order');
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [id]);

  if (loading) return (<><Header /><main className="container py-6 text-sm text-zinc-600">Loading…</main></>);
  if (err || !o) return (<><Header /><main className="container py-6 text-sm text-red-600">{err || 'Not found'}</main></>);

  const first = o.items[0];

  return (
    <>
      <Header />
      <main className="container py-6 space-y-6">
        {/* Header */}
        <section className="rounded border bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <img src={first.image || `https://picsum.photos/seed/${o.id}/80/96`} alt={first.name} className="w-16 h-20 object-cover rounded border" />
              <div>
                <div className="text-sm text-zinc-600">Order ID {o.id.slice(0, 8)}</div>
                <div className="font-medium">{first.name}</div>
                {first.size && <div className="text-sm text-zinc-600">Size: {first.size}</div>}
              </div>
            </div>
            <div className="text-sm font-medium text-emerald-700">Status: {o.status}</div>
          </div>
        </section>

        {/* Shipping + Price */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded border bg-white p-4">
            <div className="font-medium mb-2">Shipping details</div>
            <pre className="text-sm text-zinc-700 whitespace-pre-wrap">{o.address_block}</pre>
          </div>

          <div className="rounded border bg-white p-4">
            <div className="font-medium mb-2">Price details of your order</div>
            <div className="text-sm space-y-2">
              <Row label="Total MRP" value={`₹${o.price.mrp}`} />
              <Row label="Offer Discount" value={`- ₹${o.price.discount}`} />
              <Row label="Shipping fee" value={o.price.shipping_fee ? `₹${o.price.shipping_fee}` : 'Free'} />
              <Row label="Platform fee" value={`₹${o.price.platform_fee}`} />
              <div className="border-t my-2" />
              <Row label="Total Amount" value={`₹${o.price.total}`} bold />
              <div className="mt-2">Payment method: {o.payment_method}</div>
            </div>
          </div>
        </section>

        {/* Other items */}
        {o.items.length > 1 && (
          <section className="rounded border bg-white p-4">
            <div className="font-medium mb-3">Other items in this order</div>
            <ul className="divide-y">
              {o.items.slice(1).map((it: any, idx: number) => (
                <li key={idx}>
                  <Link to={`/product/${it.product_id}`} className="py-3 flex items-center justify-between hover:bg-zinc-50 block">
                    <div className="flex items-center gap-3">
                      <img src={it.image || `https://picsum.photos/seed/${o.id}-${idx}/64/80`} alt={it.name} className="w-14 h-16 object-cover rounded border" />
                      <div>
                        <div className="font-medium">{it.name}</div>
                        {it.size && <div className="text-sm text-zinc-600">Size: {it.size}</div>}
                      </div>
                    </div>
                    <div className="text-zinc-400">›</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function Row({ label, value, bold }:{label:string; value:string; bold?:boolean}) {
  return (
    <div className={`flex items-center justify-between ${bold ? 'font-semibold' : ''}`}>
      <span className="text-zinc-700">{label}</span>
      <span>{value}</span>
    </div>
  );
}
