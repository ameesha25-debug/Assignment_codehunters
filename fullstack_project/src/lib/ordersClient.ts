// import { API_BASE } from '@/lib/api';

// export type OrderRow = {
//   id: string;
//   created_at: string;
//   status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled';
//   payment_method: 'cod'|'prepaid'|'upi'|'card';
//   amount: number;
//   item_count: number;
//   // preview (optional)
//   first_item_name?: string;
//   first_item_image?: string;
//   promo_title?: string;
// };

// export async function fetchMyOrders(): Promise<OrderRow[]> {
//   const res = await fetch(`${API_BASE}/api/orders`, {
//     method: 'GET',
//     credentials: 'include'
//   });
//   if (!res.ok) {
//     const t = await res.text().catch(()=> '');
//     throw new Error(t || res.statusText);
//   }
//   return res.json() as Promise<OrderRow[]>;
// }
import { API_BASE } from '@/lib/api';

export type OrderRow = {
  id: string;
  created_at: string;
  status: 'PLACED'|'CANCELLED';
  payment_method: 'COD';
  amount: number;
  item_count: number;
  // previews (0–3 from backend)
  items?: { name: string; size?: string|null; image?: string|null }[];
};

export type OrderDetails = {
  id: string;
  created_at: string;
  status: 'PLACED'|'CANCELLED';
  payment_method: 'COD';
  amount: number;
  price: { mrp: number; discount: number; shipping_fee: number; platform_fee: number; total: number };
  address_block: string;
  items: { product_id?: string; name: string; size?: string|null; image?: string|null; qty?: number }[];
};

export async function fetchMyOrders(): Promise<OrderRow[]> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(t || res.statusText);
  }
  return res.json() as Promise<OrderRow[]>;
}

export async function fetchOrderDetails(id: string): Promise<OrderDetails> {
  const res = await fetch(`${API_BASE}/api/orders/${id}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> '');
    throw new Error(t || res.statusText);
  }
  return res.json() as Promise<OrderDetails>;
}
