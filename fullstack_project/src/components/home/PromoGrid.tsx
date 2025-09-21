import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PromoGrid() {
  return (
  <section className="section">
    <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[180px] lg:auto-rows-[200px]">
      {/* Left large */}
      <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg hover:border-gray-300 md:col-span-2 md:row-span-2">
        <img
          src="/images/promo/women.jpg"
          alt="Women"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </article>

      {/* Top right */}
      <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg hover:border-gray-300 md:col-span-2">
        <img
          src="/images/promo/promo4.png"
          alt="Men"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </article>

      {/* Bottom right - small left */}
      <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg hover:border-gray-300">
        <img
          src="/images/promo/promo2.png"
          alt="Kids"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </article>

      {/* Bottom right - small right */}
      <article className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg hover:border-gray-300">
        <img
          src="/images/promo/promo3.png"
          alt="Gift cards"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </article>
    </div>
  </section>
);

}

