// src/lib/addresses.ts
import { API_BASE } from './api';

export type Address = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  address_type?: 'HOME'|'OFFICE';
  is_default?: boolean;
  created_at?: string;
};

async function toJson<T>(res: Response): Promise<T> {
  const txt = await res.text().catch(()=> '');
  let data: any = {};
  if (txt) { try { data = JSON.parse(txt); } catch { data = { message: txt }; } }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data as T;
}

export const addresses = {
  async list(): Promise<Address[]> {
    const res = await fetch(`${API_BASE}/api/addresses`, { credentials: 'include' });
    return toJson<Address[]>(res);
  },
  async create(body: Partial<Address>): Promise<Address> {
    const res = await fetch(`${API_BASE}/api/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    return toJson<Address>(res);
  },
};
