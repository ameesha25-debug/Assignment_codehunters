// components/products/ProductCarousel.tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/lib/api";

export default function ProductCarousel({ items, title }: { items: Product[]; title?: string }) {
  return (
    <section className="container mx-auto px-4 py-6">
      {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
      <Carousel>
        <CarouselContent className="-ml-2">
          {items.map((p) => (
            <CarouselItem key={p.id} className="basis-3/4 pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <ProductCard product={p} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
