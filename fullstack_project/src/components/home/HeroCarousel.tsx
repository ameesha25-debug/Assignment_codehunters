import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const slides = [
  { img: "/images/hero/hero11.jpg", alt: "Latest arrivals" },
  { img: "/images/hero/hero2.jpg", alt: "Festive sale" },
  { img: "/images/hero/hero33.jpg", alt: "Workwear picks" },
  { img: "/images/hero/hero4.jpg", alt: "New season styles" },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const timerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rootRef  = useRef<HTMLElement | null>(null);

  const start = () => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
  };
  const stop = () => {
    if (!timerRef.current) return;
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Autoplay only when carousel is visible
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? start() : stop()),
      { threshold: 0.25 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      stop();
    };
  }, [count]);

  // Scroll the track, not the page
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    el.scrollTo({ left: child?.offsetLeft ?? 0, behavior: "smooth" });
  }, [index]);

 // HeroCarousel.tsx
return (
  <section className="w-full">
    <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <Carousel className="w-full">
        <CarouselContent ref={trackRef as any} className="flex snap-x snap-mandatory overflow-x-hidden">
          {slides.map((s, i) => (
            <CarouselItem key={i} className="basis-full snap-center">
              <img
                src={s.img}
                alt={s.alt}
                className="w-full h-[200px] sm:h-[260px] md:h-[320px] lg:h-[360px] object-cover rounded-lg"
                loading="lazy"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows outside image, like Max */}
        <button
          aria-label="Previous"
          onClick={() => setIndex((i) => (i - 1 + count) % count)}
          className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
        >
          ‹
        </button>
        <button
          aria-label="Next"
          onClick={() => setIndex((i) => (i + 1) % count)}
          className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
        >
          ›
        </button>
      </Carousel>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-2">
        {slides.map((_, i) => (
          <span key={i} className={`h-1.5 w-4 rounded-full ${i === index ? "bg-yellow-400" : "bg-muted"}`} />
        ))}
      </div>
    </div>

   
  </section>
);

}
