// src/lib/orders.ts
import { API_BASE } from './api';

async function toJson<T>(res: Response): Promise<T> {
  const txt = await res.text().catch(()=> '');
  let data: any = {};
  if (txt) { try { data = JSON.parse(txt); } catch { data = { message: txt }; } }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data as T;
}

export const orders = {
  async create(body: { address_id: string; payment_method: 'COD' }): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return toJson<{ id: string }>(res);
  },
};
