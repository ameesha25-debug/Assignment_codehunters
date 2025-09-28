// src/components/common/HeartButton.tsx
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { wishlist } from '@/lib/wishlist';
import { useWishlist } from '@/wishlist/useWishlist';
import { useMemo } from 'react';

type Props = {
  productId: string;
  // size can still be passed from PDP/UI for other flows (e.g., move-to-basket),
  // but wishlist toggling ignores size now.
  size?: string | null;
  className?: string;
  tooltip?: boolean;
};

export default function HeartButton({
  productId,
  size = null, // retained to keep prop compatibility with callers
  className = '',
  tooltip = true,
}: Props) {
  const { user } = useAuth();
  const { inWishlist, refresh } = useWishlist();

  // Check wishlist by product only (size-agnostic)
  const isWished = useMemo(() => inWishlist(productId, null), [inWishlist, productId]);

  async function onToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }));
      return;
    }

    if (isWished) {
      // Remove by product only
      await wishlist.remove(productId);
    } else {
      // Add by product only
      await wishlist.add(productId);
    }
    await refresh();
  }

  return (
    <button
      onClick={onToggle}
      type="button"
      className={'inline-flex items-center justify-center ' + className}
      aria-label={isWished ? 'Remove from favourites' : 'Add to favourites'}
      title={tooltip ? (isWished ? 'Remove from favourites' : 'Add to favourites') : undefined}
    >
      <Heart
        className={
          isWished
            ? 'h-5 w-5 text-red-500 fill-red-500'
            : 'h-5 w-5 text-gray-400 hover:text-red-500'
        }
      />
    </button>
  );
}
