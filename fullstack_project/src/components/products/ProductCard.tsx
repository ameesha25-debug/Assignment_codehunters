import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Product = {
  id: string;
  // Accept both API and UI/mock field names
  name?: string; // API
  title?: string; // UI/mock
  image_url?: string; // API
  image?: string; // UI/mock
  price: number;
  strikePrice?: number;
  rating?: number | null;
  review_count?: number | null;
  badge?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  // Resolve fields from either naming convention
  const displayTitle = product.name ?? product.title ?? "";
  const displayImage =
    product.image_url ??
    product.image ??
    `https://picsum.photos/seed/${product.id}/600/800`; // safe fallback

  return (
    <Card className="group overflow-hidden">
      <div className="relative bg-muted/30">
        <img
          src={displayImage}
          alt={displayTitle}
          className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm ring-1 ring-black/5"
        >
          <Heart className="h-4 w-4" />
        </button>
        {product.badge && (
          <Badge className="absolute left-2 top-2">{product.badge}</Badge>
        )}
      </div>

      <CardContent className="space-y-1 p-3">
        {/* Optional category label can be dynamic later */}
        <p className="caption">Dresses</p>
        <p className="line-clamp-1 text-sm">{displayTitle}</p>

        <div className="flex items-center gap-2">
          <p className="font-semibold">₹{product.price}</p>
          {product.strikePrice && (
            <p className="text-xs text-muted-foreground line-through">
              ₹{product.strikePrice}
            </p>
          )}
        </div>

        {product.rating != null && (
          <p className="caption">
            ★ {product.rating.toFixed(1)} - {product.review_count ?? 0} reviews
          </p>
        )}
      </CardContent>

      <CardFooter className="p-3">
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
