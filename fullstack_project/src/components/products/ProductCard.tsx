// components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/api';
import { cart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { wishlist } from '@/lib/wishlist';
import { useWishlist } from '@/wishlist/useWishlist';
import { useCallback, useMemo } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const displayTitle = product.name ?? '';
  const displayImage = product.image_url ?? `https://picsum.photos/seed/${product.id}/600/800`;

  // Heuristic: set to true if this product/category requires size selection
  const productRequiresSize = false; // TODO: replace with an actual flag or category check

  // Wishlist integration
  const { inWishlist, refresh } = useWishlist();
  // Visual toggle state
  const isWished = useMemo(() => inWishlist(product.id, null), [inWishlist, product.id]);

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
          await wishlist.remove(product.id, null);
        } else {
          await wishlist.add(product.id, null);
        }
        // wishlist client emits 'wishlist-updated'; refresh for instant local update
        await refresh();
      } catch (err: any) {
        alert(err?.message || 'Failed to update favourites');
      }
    },
    [user, isWished, product.id, refresh]
  );

  async function handleAddToBasket(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }));
      return;
    }
    if (productRequiresSize) {
      window.location.assign(`/product/${product.id}`);
      return;
    }
    try {
      await cart.addItem(product.id, 1, null);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      const btn = (e.currentTarget as HTMLButtonElement) || null;
      if (btn) {
        btn.classList.add('ring', 'ring-amber-400');
        setTimeout(() => {
          if (btn) btn.classList.remove('ring', 'ring-amber-400');
        }, 500);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to add to basket');
    }
  }

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
        {/* Active: red heart with fill; Inactive: muted gray with hover to red */}
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
          <span className="absolute left-3 top-3 z-10 rounded bg-yellow-400 px-2 py-1 text-xs font-semibold shadow">
            {product.badge}
          </span>
        )}

        {/* Basket icon (hover)
        <button
          className="absolute right-3 bottom-3 z-20 flex h-12 w-9 items-center justify-center rounded-full border-2 border-gray-400 bg-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Add to basket"
          onClick={handleAddToBasket}
          type="button"
          style={{ aspectRatio: '3/4' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <rect x="5" y="7.5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 10V8a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button> */}
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
