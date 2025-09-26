// src/lib/payments.ts
import { API_BASE } from './api';

// Shared small helper to parse JSON and surface readable errors
async function toJson<T>(res: Response): Promise<T> {
  const text = await res.text().catch(() => '');
  let data: any = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data as T;
}

/**
 * Start a Payment Intent for the signed-in user's current cart.
 * Server validates address ownership and computes amount from DB.
 * Returns client_secret for Stripe Elements.
 */

export async function createPaymentIntent(address_id: string): Promise<{ client_secret: string }> {
  if (!address_id) throw new Error('address_id required');
  const res = await fetch(`${API_BASE}/api/payments/create-intent`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address_id }),
  });
  return toJson<{ client_secret: string }>(res);
}

/**
 * Finalize the order after stripe.confirmPayment() returns 'succeeded'
 * in the no-webhook demo flow.
 * The server retrieves and verifies the Payment Intent, snapshots items,
 * creates the order, clears the cart, and returns the new order id.
 */
export async function stripeComplete(
  address_id: string,
  payment_intent_id: string
): Promise<{ id: string }> {
  if (!address_id || !payment_intent_id) {
    throw new Error('address_id and payment_intent_id are required');
  }
  const res = await fetch(`${API_BASE}/api/payments/stripe-complete`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address_id, payment_intent_id }),
  });
  return toJson<{ id: string }>(res);
}
