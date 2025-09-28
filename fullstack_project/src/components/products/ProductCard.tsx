// components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/api';

import { useAuth } from '@/lib/auth';
import { wishlist } from '@/lib/wishlist';
import { useWishlist } from '@/wishlist/useWishlist';
import { useCallback, useMemo } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const displayTitle = product.name ?? '';
  const displayImage = product.image_url ?? `https://picsum.photos/seed/${product.id}/600/800`;

  // Wishlist integration (size-agnostic)
  const { inWishlist, refresh } = useWishlist();
  const isWished = useMemo(
    () => inWishlist(product.id, null),
    [inWishlist, product.id]
  );

  const toggleWishlist = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }));
        return;
      }
      try {
        if (isWished) {
          // remove by product only
          await wishlist.remove(product.id);
        } else {
          // add by product only
          await wishlist.add(product.id);
        }
        await refresh();
      } catch (err: any) {
        alert(err?.message || 'Failed to update favourites');
      }
    },
    [user, isWished, product.id, refresh]
  );

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-sm">
      {/* Wishlist icon */}
      <button
        className="absolute z-20 right-3 top-3 flex h-12 w-9 items-center justify-center rounded-full border-2 border-gray-400 bg-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label={isWished ? 'Remove from favourites' : 'Add to favourites'}
        onClick={toggleWishlist}
        type="button"
        style={{ aspectRatio: '3/4' }}
        title={isWished ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Heart
          className={
            'h-5 w-5 stroke-2 ' +
            (isWished ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500')
          }
        />
      </button>

      {/* Image + badge */}
      <Link
        to={`/product/${product.id}`}
        aria-label={displayTitle}
        tabIndex={-1}
        className="block relative rounded-t-xl overflow-hidden bg-muted aspect-[3/4]"
      >
        <img
          src={displayImage}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded bg-white text-black px-2 py-1 text-xs font-semibold shadow ring-1 ring-black/10">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col gap-0.5 px-4 pt-3 pb-2">
        <Link to={`/product/${product.id}`}>
          <div className="line-clamp-1 text-[15px] font-semibold text-gray-800 leading-tight mb-1">
            {displayTitle}
          </div>
        </Link>
        <div className="text-[14px] font-semibold text-gray-800">₹{product.price}</div>
        {product.rating != null && (
          <div className="text-sm text-gray-800 mt-2 flex items-center gap-1">
            {product.rating}
            <span aria-hidden="true">★</span>
            <span className="mx-1">·</span>
            {product.review_count ?? 0}
          </div>
        )}
      </div>
    </div>
  );
}
