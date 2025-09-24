import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/api"; // Ensure this path is correct and you import Product type

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const displayTitle = product.name ?? "";
  const displayImage =
    product.image_url ??
    `https://picsum.photos/seed/${product.id}/600/800`;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-sm">
      {/* Wishlist icon - top right outside image, appears on hover */}
      <button
        className="absolute z-20 right-3 top-3 flex h-12 w-9 items-center justify-center rounded-full border-2 border-gray-400 bg-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Add to favourites"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate("/wishlist");
        }}
        type="button"
        style={{ aspectRatio: "3/4" }}
      >
        <Heart className="h-5 w-5 stroke-2 text-gray-800" />
      </button>

      {/* Image and badge */}
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

        {/* Basket icon inside image bottom right, hover only */}
        <button
          className="absolute right-3 bottom-3 z-20 flex h-12 w-9 items-center justify-center rounded-full border-2 border-gray-400 bg-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Add to basket"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/basket");
          }}
          type="button"
          style={{ aspectRatio: "3/4" }}
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
            <rect
              x="5"
              y="7.5"
              width="14"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9 10V8a3 3 0 1 1 6 0v2"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>
      </Link>

      {/* Product details */}
      <div className="flex flex-col gap-0.5 px-4 pt-3 pb-2">
        <Link to={`/product/${product.id}`}>
          <div className="line-clamp-1 text-[15px] font-semibold text-gray-800 leading-tight mb-1">
            {displayTitle}
          </div>
        </Link>
        <div className="text-[14px] font-semibold text-gray-800">
          ₹{product.price}
        </div>
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
