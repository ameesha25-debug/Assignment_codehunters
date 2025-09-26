// src/components/HeroCarousel.tsx
import { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const slides = [
  { img: "/images/hero/hero11.jpg", alt: "Latest arrivals" },
  { img: "/images/hero/hero2.jpg",  alt: "Festive sale" },
  { img: "/images/hero/hero33.jpg", alt: "Workwear picks" },
  { img: "/images/hero/hero4.jpg",  alt: "New season styles" },
];

const INTERVAL_MS = 3000; // exact 3s

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  // Refs
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const kickoffRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const isFocusedRef  = useRef(false);
  const isVisibleRef  = useRef(false);

  // Advance forward; wrap to first
  const step = () => setIndex((i) => (i + 1) % count);

  // Helpers to check if autoplay is allowed
  const allowAutoplay = () =>
    isVisibleRef.current && !isHoveringRef.current && !isFocusedRef.current;

  // Start cadence with an initial precise timeout, then steady interval
  const startCadence = () => {
    if (!allowAutoplay()) return;
    if (timerRef.current != null || kickoffRef.current != null) return;

    // First tick exactly after INTERVAL_MS
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

  const restartCadence = () => {
    stopCadence();
    startCadence();
  };

  // Kickoff on mount; clean on unmount
  useEffect(() => {
    startCadence();
    return stopCadence;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visibility observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = !!entries[0]?.isIntersecting;
        isVisibleRef.current = vis;
        if (vis) startCadence();
        else stopCadence();
      },
      { threshold: 0 } // treat any visibility as visible
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

  // Smooth scroll to active slide
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    const left = child ? child.offsetLeft : 0;
    track.scrollTo({ left, behavior: "smooth" });
  }, [index]);

  // Handlers to pause/resume on interaction
  const onMouseEnter = () => { isHoveringRef.current = true; stopCadence(); };
  const onMouseLeave = () => { isHoveringRef.current = false; startCadence(); };
  const onFocusIn    = () => { isFocusedRef.current  = true; stopCadence(); };
  const onFocusOut   = () => { isFocusedRef.current  = false; startCadence(); };

  // Manual controls keep cadence precise
  const onPrev = () => { setIndex((i) => (i - 1 + count) % count); restartCadence(); };
  const onNext = () => { setIndex((i) => (i + 1) % count); restartCadence(); };
  const onDot  = (i: number) => { setIndex(i % count); restartCadence(); };

  return (
    <section
      ref={sectionRef as any}
      className="w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocusIn}
      onBlur={onFocusOut}
    >
      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Carousel className="w-full">
          <CarouselContent
            ref={trackRef as any}
            className="flex snap-x snap-mandatory overflow-x-hidden"
          >
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

          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={onPrev}
            className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={onNext}
            className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
          >
            ›
          </button>
        </Carousel>

        {/* Dots */}
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => onDot(i)}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i === index ? "bg-yellow-400" : "bg-muted hover:bg-muted/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
