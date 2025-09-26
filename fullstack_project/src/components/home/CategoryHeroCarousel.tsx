// src/components/home/CategoryHeroCarousel.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHeroCategories, type CategoryHero } from "@/lib/api";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Edit slugs here to match your DB
const SLUGS = ["footwear", "beauty", "bags"] as const;
const IMAGE_OVERRIDES: Record<string, string> = {
  footwear: "/images/categoryHero/footwear.jpg",
  beauty: "/images/categoryHero/beauty.jpg",
  bags: "/images/categoryHero/bags.jpg",
};

const INTERVAL_MS = 2000; // 3s cadence

export default function CategoryHeroCarousel() {
  const [items, setItems] = useState<CategoryHero[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // autoplay control
  const timerRef = useRef<number | null>(null);
  const kickoffRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const isFocusedRef  = useRef(false);
  const isVisibleRef  = useRef(false);

  const navigate = useNavigate();

  // Load categories once
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const rows = await fetchHeroCategories(SLUGS as unknown as string[]);
        if (!cancel) setItems(rows);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // Snap to slide
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    el.scrollTo({ left: child?.offsetLeft ?? 0, behavior: "smooth" });
  }, [index]);

  // Advance forward; wrap
  const step = () => setIndex((i) => items.length ? (i + 1) % items.length : 0);

  // Helpers
  const allowAutoplay = () =>
    isVisibleRef.current && !isHoveringRef.current && !isFocusedRef.current && items.length > 1;

  const startCadence = () => {
    if (!allowAutoplay()) return;
    if (timerRef.current != null || kickoffRef.current != null) return;
    kickoffRef.current = window.setTimeout(() => {
      kickoffRef.current = null;
      step();
      if (allowAutoplay() && timerRef.current == null) {
        timerRef.current = window.setInterval(step, INTERVAL_MS);
      }
    }, INTERVAL_MS);
  };

  const stopCadence = () => {
    if (kickoffRef.current != null) {
      window.clearTimeout(kickoffRef.current);
      kickoffRef.current = null;
    }
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const restartCadence = () => { stopCadence(); startCadence(); };

  // Kickoff when items are loaded
  useEffect(() => {
    if (items.length > 1) startCadence();
    return stopCadence;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Visibility observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = !!entries[0]?.isIntersecting;
        isVisibleRef.current = vis;
        if (vis) startCadence(); else stopCadence();
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause when tab is hidden
  useEffect(() => {
    const onVis = () => (document.hidden ? stopCadence() : startCadence());
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interaction pause/resume
  const onMouseEnter = () => { isHoveringRef.current = true; stopCadence(); };
  const onMouseLeave = () => { isHoveringRef.current = false; startCadence(); };
  const onFocusIn    = () => { isFocusedRef.current  = true; stopCadence(); };
  const onFocusOut   = () => { isFocusedRef.current  = false; startCadence(); };

  if (loading) {
    return (
      <section className="container">
        <h3 className="mb-4 text-xl font-semibold">Shop the edit</h3>
        <div className="h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] animate-pulse rounded-lg bg-muted/50" />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef as any}
      className="container"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocusIn}
      onBlur={onFocusOut}
    >
      <h3 className="mb-4 text-xl font-semibold">Shop the edit</h3>

      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent
            ref={trackRef as any}
            className="flex snap-x snap-mandatory overflow-x-hidden"
          >
            {items.map((c) => (
              <CarouselItem key={c.id} className="basis-full snap-center">
                <button
                  onClick={() => navigate(`/category/${c.slug}`)}
                  className="group block w-full overflow-hidden rounded-lg ring-1 ring-border hover:ring-foreground"
                  title={c.name}
                >
                  <div className="w-full h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] overflow-hidden">
                    <img
                      src={
                        IMAGE_OVERRIDES[c.slug] ??
                        c.image_url ??
                        "/images/placeholder.png"
                      }
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={() => { setIndex((i) => (i - 1 + items.length) % items.length); restartCadence(); }}
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => { setIndex((i) => (i + 1) % items.length); restartCadence(); }}
            className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
          >
            ›
          </button>
        </Carousel>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => { setIndex(i % items.length); restartCadence(); }}
              className={`h-1.5 w-4 rounded-full ${i === index ? "bg-yellow-400" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
