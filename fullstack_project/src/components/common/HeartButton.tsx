// src/components/common/HeartButton.tsx
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { wishlist } from '@/lib/wishlist';
import { useWishlist } from '@/wishlist/useWishlist';
import { useMemo } from 'react';

type Props = {
  productId: string;
  size?: string | null;
  className?: string;
  tooltip?: boolean;
};

export default function HeartButton({ productId, size = null, className = '', tooltip = true }: Props) {
  const { user } = useAuth();
  const { inWishlist, refresh } = useWishlist();
  const isWished = useMemo(() => inWishlist(productId, size), [inWishlist, productId, size]);

  async function onToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-auth', { detail: 'signin' }));
      return;
    }
    if (isWished) {
      await wishlist.remove(productId, size);
    } else {
      await wishlist.add(productId, size);
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
      <Heart className={isWished ? 'h-5 w-5 text-red-500 fill-red-500' : 'h-5 w-5 text-gray-400 hover:text-red-500'} />
    </button>
  );
}
