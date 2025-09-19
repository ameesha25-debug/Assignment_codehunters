import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const slides = [
  { img: "/images/hero/hero1.jpg", alt: "Latest arrivals" },
  { img: "/images/hero/hero2.jpg", alt: "Festive sale" },
  { img: "/images/hero/hero3.jpg", alt: "Workwear picks" },
];

export default function HeroCarousel() {
  return (
    <section className="container mx-auto px-4 py-6">
      <Carousel className="w-full">
        <CarouselContent>
          {slides.map((s, i) => (
            <CarouselItem key={i}>
              <img src={s.img} alt={s.alt} className="h-[320px] w-full rounded-lg object-cover md:h-[420px]" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="mt-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="promo">
            <AccordionTrigger className="text-sm">Offers and terms</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Free shipping over ₹999. Easy 15‑day returns. COD available.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
