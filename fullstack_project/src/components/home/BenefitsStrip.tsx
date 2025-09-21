import React from "react";

type Benefit = { img: string; alt: string; title: string; subtitle: string };

const benefits: Benefit[] = [
  { img: "/images/benefits/img1.jpg", alt: "Free Shipping", title: "Free Shipping", subtitle: "on fashion above ₹699" },
  { img: "/images/benefits/img2.jpg", alt: "Easy Returns", title: "Easy Returns & Exchange", subtitle: "within 7 days" },
  { img: "/images/benefits/img3.jpg", alt: "Collect & Return", title: "Collect & Return", subtitle: "your online orders at stores" },
];

export default function BenefitsStrip() {
  return (
    <section aria-labelledby="benefits-heading" className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h2 id="benefits-heading" className="text-2xl font-semibold">Our Benefits</h2>
        <div className="mt-1 h-1 w-16 bg-amber-400 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b, i) => (
          <article
            key={i}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm
                       hover:shadow-md hover:border-gray-300 transition p-3 sm:p-4"
          >
            <div className="shrink-0 grid place-items-center h-16 w-16 rounded-full bg-amber-400/90">
              <img src={b.img} alt={b.alt} className="h-9 w-9 object-contain drop-shadow-sm" loading="lazy" />
            </div>
            <div className="min-w-0">
              <p className="text-fuchsia-600 font-semibold tracking-wide">{b.title}</p>
              <p className="text-gray-700 text-sm truncate">{b.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
