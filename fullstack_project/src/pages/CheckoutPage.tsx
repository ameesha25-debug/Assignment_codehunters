import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/common/Header';
import { cart } from '@/lib/cart';
import { addresses, type Address } from '@/lib/addresses';
import { orders } from '@/lib/orders';

// NEW: Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { createPaymentIntent, stripeComplete } from '@/lib/payments';

type Step = 'shipping' | 'payment';

function OrderSuccessModal({
  open, orderId, onView, onClose
}: { open:boolean; orderId:string; onView:()=>void; onClose:()=>void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-emerald-50 px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500 text-white grid place-items-center">✓</div>
          <div>
            <div className="font-semibold text-emerald-700">Thanks! Order placed</div>
            <div className="text-sm text-emerald-700/80">Order #{orderId.slice(0,8)} has been confirmed.</div>
          </div>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          A confirmation has been created. Track it anytime in My Orders. 🎉
        </div>
        <div className="px-5 py-4 bg-zinc-50 flex items-center justify-end gap-3">
          <button className="px-3 py-2 text-zinc-700" onClick={onClose}>Continue</button>
          <button className="px-4 py-2 rounded bg-amber-500 text-white font-semibold" onClick={onView}>
            View orders
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressForm({
  onSubmit, onCancel, busy,
}: { onSubmit: (a: Partial<Address>) => void; onCancel: () => void; busy: boolean }) {
  const [f, setF] = useState<Partial<Address>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Regex rules
  const nameRe = /^[A-Za-z ]{2,60}$/;
  const cityStateRe = /^[A-Za-z ]{2,60}$/;
  const phoneRe = /^[0-9]{10}$/;   // exactly 10 digits
  const pincodeRe = /^[0-9]{6}$/;  // exactly 6 digits

  // helpers
  const touchOnFirstChange = (key: string, value: string) => {
    if (!touched[key] && value.length > 0) setTouched((t) => ({ ...t, [key]: true }));
  };

  const err: Record<string, string | null> = {
    full_name:
      (touched.full_name && !f.full_name) ? 'Full name is required'
      : (f.full_name && !nameRe.test(f.full_name!)) ? 'Enter a valid name (letters and spaces only)'
      : null,

    phone:
      (touched.phone && !f.phone) ? 'Mobile number is required'
      : (f.phone && !phoneRe.test(String(f.phone))) ? 'Enter a 10‑digit mobile number'
      : null,

    line1:
      (touched.line1 && !f.line1) ? 'Address line 1 is required'
      : null,

    city:
      (touched.city && !f.city) ? 'City is required'
      : (f.city && !cityStateRe.test(f.city!)) ? 'Enter a valid city (letters and spaces only)'
      : null,

    state:
      (touched.state && !f.state) ? 'State is required'
      : (f.state && !cityStateRe.test(f.state!)) ? 'Enter a valid state (letters and spaces only)'
      : null,

    pincode:
      (touched.pincode && !f.pincode) ? 'Pincode is required'
      : (f.pincode && !pincodeRe.test(String(f.pincode))) ? 'Enter a 6‑digit pincode'
      : null,
  };

  const hasErrors =
    ['full_name','phone','line1','city','state','pincode'].some(k => !(f as any)[k]) ||
    Object.values(err).some(Boolean);

  const helper = (id: keyof typeof err) =>
    touched[String(id)] && err[String(id)]
      ? <div className="text-xs text-red-600 mt-1">{err[String(id)]}</div>
      : null;

  return (
    <div className="border rounded">
      {/* Header with close (X) */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-zinc-50">
        <div className="font-medium">Add new address</div>
        <button
          type="button"
          aria-label="Close"
          className="h-8 w-8 grid place-items-center rounded hover:bg-zinc-200"
          onClick={onCancel}
          title="Close"
        >
          ×
        </button>
      </div>

      <form
        className="grid grid-cols-2 gap-3 p-3"
        onSubmit={(e)=>{ e.preventDefault(); if (!hasErrors) onSubmit(f); }}
        noValidate
      >
        {/* Name */}
        <div className="col-span-1">
          <input
            className={`border rounded p-2 w-full ${touched.full_name && err.full_name ? 'border-red-500' : ''}`}
            placeholder="Full name"
            required
            value={f.full_name || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, full_name:v}); touchOnFirstChange('full_name', v); }}
            onBlur={()=> setTouched(t => ({ ...t, full_name: true }))}
          />
          {helper('full_name')}
        </div>

        {/* Phone */}
        <div className="col-span-1">
          <input
            className={`border rounded p-2 w-full ${touched.phone && err.phone ? 'border-red-500' : ''}`}
            placeholder="Phone"
            inputMode="numeric"
            required
            value={f.phone || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, phone:v}); touchOnFirstChange('phone', v); }}
            onBlur={()=>{ const v=String(f.phone||''); const cleaned=v.replace(/\D/g,''); setF(prev=>({...prev, phone: cleaned})); setTouched(t=>({...t, phone:true})); }}
          />
          {helper('phone')}
        </div>

        {/* Line 1 */}
        <div className="col-span-2">
          <input
            className={`border rounded p-2 w-full ${touched.line1 && err.line1 ? 'border-red-500' : ''}`}
            placeholder="Address line 1"
            required
            value={f.line1 || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, line1:v}); touchOnFirstChange('line1', v); }}
            onBlur={()=> setTouched(t => ({ ...t, line1: true }))}
          />
          {helper('line1')}
        </div>

        {/* Line 2 optional */}
        <div className="col-span-2">
          <input
            className="border rounded p-2 w-full"
            placeholder="Address line 2 (optional)"
            value={f.line2 || ''}
            onChange={e=>setF({...f, line2:e.target.value})}
          />
        </div>

        {/* City */}
        <div className="col-span-1">
          <input
            className={`border rounded p-2 w-full ${touched.city && err.city ? 'border-red-500' : ''}`}
            placeholder="City"
            required
            value={f.city || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, city:v}); touchOnFirstChange('city', v); }}
            onBlur={()=> setTouched(t => ({ ...t, city: true }))}
          />
          {helper('city')}
        </div>

        {/* State */}
        <div className="col-span-1">
          <input
            className={`border rounded p-2 w-full ${touched.state && err.state ? 'border-red-500' : ''}`}
            placeholder="State"
            required
            value={f.state || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, state:v}); touchOnFirstChange('state', v); }}
            onBlur={()=> setTouched(t => ({ ...t, state: true }))}
          />
          {helper('state')}
        </div>

        {/* Pincode */}
        <div className="col-span-1">
          <input
            className={`border rounded p-2 w-full ${touched.pincode && err.pincode ? 'border-red-500' : ''}`}
            placeholder="Pincode"
            inputMode="numeric"
            required
            value={f.pincode || ''}
            onChange={(e)=>{ const v=e.target.value; setF({...f, pincode:v}); touchOnFirstChange('pincode', v); }}
            onBlur={()=>{ const v=String(f.pincode||''); const cleaned=v.replace(/\D/g,''); setF(prev=>({...prev, pincode: cleaned})); setTouched(t=>({...t, pincode:true})); }}
          />
          {helper('pincode')}
        </div>

        <div className="col-span-2 flex gap-2">
          <button disabled={busy || hasErrors} className="px-3 py-2 bg-amber-500 text-white rounded disabled:opacity-50">
            Save
          </button>
          <button type="button" className="px-3 py-2 border rounded" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

function StripeSection({
  clientSecret,
  addressId,
  onSuccess,
}: {
  clientSecret: string;
  addressId: string;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const onPay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) {
      alert(error.message || 'Payment failed');
      setBusy(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      try {
        const r = await stripeComplete(addressId, paymentIntent.id);
        onSuccess(r.id);
      } catch (e: any) {
        alert(e?.message || 'Failed to create order');
      }
    } else {
      alert(`Payment status: ${paymentIntent?.status}`);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <PaymentElement />
      <button
        className="rounded bg-amber-500 text-white px-4 py-2 font-semibold disabled:opacity-50"
        disabled={busy}
        onClick={onPay}
      >
        {busy ? 'Processing…' : 'Pay now'}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const [addrList, setAddrList] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [step, setStep] = useState<Step>('shipping');
  // NEW: include STRIPE method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'STRIPE' | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [placedId, setPlacedId] = useState<string>('');

  const [cartItems, setCartItems] = useState<Array<{ price: number; qty: number; name?: string; image_url?: string }>>([]);
  const totalMRP = useMemo(() => cartItems.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0), [cartItems]);
  const offerDiscount = useMemo(() => {
    let discount = 0;
    for (const it of cartItems) {
      const line = (it.price || 0) * (it.qty || 0);
      if (line <= 0) continue;
      const pct = 0.05 + Math.random() * 0.05;
      discount += Math.min(Math.round(line * pct), 400);
    }
    return discount;
  }, [cartItems, totalMRP]);
  const platformFee = 20;
  const grandTotal = Math.max(0, totalMRP - offerDiscount + platformFee);
  const totalText = useMemo(()=>`₹${grandTotal}`, [grandTotal]);
  const [showDetails, setShowDetails] = useState(false);

  // NEW: Stripe client secret
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [startingStripe, setStartingStripe] = useState(false);

  useEffect(()=> {
    (async ()=>{
      const c = await cart.get();
      setCartItems((c?.items || []).map((it:any) => ({
        price: it.price, qty: it.qty, name: it.name, image_url: it.image_url
      })));

      const list = await addresses.list();
      setAddrList(list);
      const def = list.find(a=>a.is_default) || list[0];
      if (def) setSelectedAddr(def.id);
      if (!list.length) setShowForm(true);
    })();
  }, []);

  async function handleAddAddress(form: Partial<Address>) {
    setBusy(true);
    try {
      const created = await addresses.create(form);
      const list = await addresses.list();
      setAddrList(list);
      setSelectedAddr(created.id);
      setShowForm(false);
    } catch (e:any) {
      alert(e?.message || 'Failed to add address');
    } finally {
      setBusy(false);
    }
  }

  function proceedToPayment() {
    if (!selectedAddr) return;
    setStep('payment');
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  async function placeOrder() {
    if (!selectedAddr || paymentMethod !== 'COD') return;
    setPlacing(true);
    try {
      const order = await orders.create({ address_id: selectedAddr, payment_method: 'COD' });
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setPlacedId(order.id);
      setSuccessOpen(true);
      setTimeout(() => {
        if (successOpen) {
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: 'signed-in' }));
          window.history.pushState({}, '', '/orders');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }, 2000);
    } catch (e:any) {
      alert(e?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  }

  // NEW: start Stripe PI and show PaymentElement
  async function startStripe() {
    if (!selectedAddr || clientSecret || startingStripe) return;
    setStartingStripe(true);
    try {
      const { client_secret } = await createPaymentIntent(selectedAddr);
      setClientSecret(client_secret);
    } catch (e:any) {
      alert(e?.message || 'Failed to start payment');
    } finally {
      setStartingStripe(false);
    }
  }

  return (
    <>
      <Header />
      <style>{`.animate-fadeIn{animation:fadeIn .15s ease-out}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <main className="container py-6">
        <h1 className="text-xl font-semibold mb-4">Checkout</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Shipping + Payment */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Shipping */}
            <section className="rounded border bg-white p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Shipping address</h3>
                <button className="text-amber-600 underline" onClick={()=>setShowForm(true)}>
                  Add new address
                </button>
              </div>

              {showForm && (
                <AddressForm busy={busy} onCancel={()=>setShowForm(false)} onSubmit={handleAddAddress}/>
              )}

              {addrList.length > 0 && (
                <ul className="space-y-3">
                  {addrList.map(a => {
                    const isSelected = selectedAddr === a.id;
                    return (
                      <li key={a.id} className={`border rounded p-3 ${isSelected ? 'ring-2 ring-amber-500' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="addr"
                            checked={isSelected}
                            onChange={()=>setSelectedAddr(a.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold">{a.full_name}</div>
                                {a.is_default && <span className="text-[10px] rounded bg-zinc-100 px-1">DEFAULT</span>}
                              </div>

                              {isSelected && step === 'shipping' && (
                                <button
                                  className="rounded bg-amber-500 text-white px-4 py-2 font-semibold"
                                  onClick={proceedToPayment}
                                >
                                  PROCEED TO PAYMENT
                                </button>
                              )}
                            </div>

                            <div className="mt-1 text-sm text-zinc-700">
                              {a.line1}{a.line2?`, ${a.line2}`:''}, {a.city}, {a.state} {a.pincode}
                            </div>
                            <div className="text-xs text-zinc-600">Mobile Number: {a.phone}</div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Payment */}
            {step === 'payment' && (
              <section id="payment-section" className="rounded border bg-white p-4 space-y-4">
                <h3 className="font-semibold">Payment</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    className={`text-left border rounded p-3 ${paymentMethod==='COD' ? 'ring-2 ring-amber-500' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-xs text-zinc-600 mt-1">Pay at delivery by cash/card/UPI</div>
                  </button>

                  {/* NEW: Stripe tile */}
                  <button
                    type="button"
                    className={`text-left border rounded p-3 ${paymentMethod==='STRIPE' ? 'ring-2 ring-amber-500' : ''}`}
                    onClick={async () => {
                      setPaymentMethod('STRIPE');
                      await startStripe();
                    }}
                    disabled={!selectedAddr || startingStripe}
                  >
                    <div className="font-medium">Card / UPI (Stripe)</div>
                    <div className="text-xs text-zinc-600 mt-1">Secure checkout via Stripe</div>
                  </button>
                </div>

                {paymentMethod === 'COD' && (
                  <button
                    className="rounded bg-amber-500 text-white px-4 py-2 font-semibold disabled:opacity-50"
                    disabled={!selectedAddr || placing}
                    onClick={placeOrder}
                  >
                    {placing ? 'Placing…' : 'Place order'}
                  </button>
                )}

                {/* NEW: Stripe PaymentElement and Pay button */}
                {paymentMethod === 'STRIPE' && clientSecret && selectedAddr && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeSection
                      clientSecret={clientSecret}
                      addressId={selectedAddr}
                      onSuccess={(orderId) => {
                        window.dispatchEvent(new CustomEvent('cart-updated'));
                        setPlacedId(orderId);
                        setSuccessOpen(true);
                        setTimeout(() => {
                          if (successOpen) {
                            window.dispatchEvent(new CustomEvent('auth-changed', { detail: 'signed-in' }));
                            window.history.pushState({}, '', '/orders');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }
                        }, 1200);
                      }}
                    />
                  </Elements>
                )}
              </section>
            )}
          </div>

          {/* Right: Order Summary (totals + collapsible details) */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="rounded border bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-700">Total MRP</span>
                <span className="font-medium">₹{totalMRP}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-700">Offer discount</span>
                <span className="font-medium text-emerald-600">- ₹{offerDiscount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-700">Shipping fee</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-700">Platform fee</span>
                <span className="font-medium">₹{platformFee}</span>
              </div>
              <div className="my-3 h-px bg-zinc-200" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{totalText}</span>
              </div>
            </div>

            <div className="rounded border bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="font-medium">Order summary</div>
                <button
                  className="text-amber-600 underline text-sm"
                  onClick={()=> setShowDetails(d => !d)}
                  aria-expanded={showDetails}
                  aria-controls="order-summary-details"
                >
                  {showDetails ? 'Hide details' : 'Details'}
                </button>
              </div>

              {showDetails && (
                <div id="order-summary-details" className="px-4 pb-4">
                  <ul className="space-y-3">
                    {cartItems.map((it:any, idx:number) => (
                      <li key={idx} className="border rounded p-3">
                        <div className="flex gap-3">
                          <img
                            src={it.image_url || `https://picsum.photos/seed/${idx}/96/96`}
                            alt={it.name || 'Item'}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-medium line-clamp-1">{it.name || 'Item'}</div>
                              <div className="text-sm">Qty: {it.qty}</div>
                            </div>
                            <div className="mt-1 text-sm">₹{it.price}</div>
                            <div className="mt-1 text-xs text-zinc-600 flex items-center gap-1">
                              <span>Delivery by 5–7 days</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <OrderSuccessModal
        open={successOpen}
        orderId={placedId}
        onView={() => {
          setSuccessOpen(false);
          window.dispatchEvent(new CustomEvent('auth-changed', { detail: 'signed-in' }));
          window.history.pushState({}, '', '/orders');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        onClose={()=>{ setSuccessOpen(false); }}
      />
    </>
  );
}
