// src/lib/sorters.ts
export type SortKey = "recommended" | "price_low" | "price_high" | "new";

export function sortProducts<T extends {
  price: number;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
  id: string;
}>(items: T[], key: SortKey): T[] {
  const arr = [...items];

  if (key === "recommended") {
    arr.sort((a, b) => {
      const ar = a.rating == null ? -Infinity : a.rating!;
      const br = b.rating == null ? -Infinity : b.rating!;
      if (br !== ar) return br - ar;
      const ac = a.review_count ?? -Infinity;
      const bc = b.review_count ?? -Infinity;
      if (bc !== ac) return bc - ac;
      return a.price - b.price;
    });
    return arr;
  }

  if (key === "price_low") {
    arr.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      const ar = a.rating == null ? -Infinity : a.rating!;
      const br = b.rating == null ? -Infinity : b.rating!;
      if (br !== ar) return br - ar;
      return (b.review_count ?? 0) - (a.review_count ?? 0);
    });
    return arr;
  }

  if (key === "price_high") {
    arr.sort((a, b) => {
      if (a.price !== b.price) return b.price - a.price;
      const ar = a.rating == null ? -Infinity : a.rating!;
      const br = b.rating == null ? -Infinity : b.rating!;
      if (br !== ar) return br - ar;
      return (b.review_count ?? 0) - (a.review_count ?? 0);
    });
    return arr;
  }

  // "new"
  arr.sort((a, b) => {
    const ad = a.created_at ? Date.parse(a.created_at) : 0;
    const bd = b.created_at ? Date.parse(b.created_at) : 0;
    return bd - ad || b.id.localeCompare(a.id);
  });
  return arr;
}
