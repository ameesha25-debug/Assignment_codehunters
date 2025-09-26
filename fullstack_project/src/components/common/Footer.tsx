// import { Link } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import {  useEffect, useMemo, useState } from "react";
// import type { FormEvent } from "react";
// import { api, type Category } from "@/lib/api";

// // Top-level buckets to render
// const topBuckets: { label: string; slug: string }[] = [
//   { label: "Women", slug: "women" },
//   { label: "Men", slug: "men" },
//   { label: "Kids", slug: "kids" },
//   { label: "Shoes & Bags", slug: "footwear" }, // footwear + bags merged
//   { label: "Beauty", slug: "beauty" },
// ];

// export default function Footer() {
//   const [map, setMap] = useState<Record<string, Category[]>>({});
//   const [bagsChildren, setBagsChildren] = useState<Category[] | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let active = true;
//     async function load() {
//       setLoading(true);
//       try {
//         const results = await Promise.allSettled(
//           ["women", "men", "kids", "footwear", "bags", "beauty"].map((slug) =>
//             api.categoryPage(slug).then((r) => ({ slug, children: r.children || [] }))
//           )
//         );
//         if (!active) return;

//         const m: Record<string, Category[]> = {};
//         let bags: Category[] | null = null;

//         for (const r of results) {
//           if (r.status === "fulfilled") {
//             const { slug, children } = r.value;
//             if (slug === "bags") bags = children;
//             else m[slug] = children;
//           }
//         }
//         setMap(m);
//         setBagsChildren(bags);
//       } finally {
//         if (active) setLoading(false);
//       }
//     }
//     load();
//     return () => {
//       active = false;
//     };
//   }, []);

//   const shoesAndBags = useMemo<Category[]>(() => {
//     const fw = map["footwear"] || [];
//     const bg = bagsChildren || [];
//     const list = [...fw, ...bg];
//     const seen = new Set<string>();
//     const dedup: Category[] = [];
//     for (const c of list) {
//       if (!c?.slug || seen.has(c.slug)) continue;
//       seen.add(c.slug);
//       dedup.push(c);
//       if (dedup.length >= 10) break;
//     }
//     return dedup;
//   }, [map, bagsChildren]);

//   function onSubscribe(e: FormEvent) {
//     e.preventDefault();
//     // TODO: wire to newsletter service
//   }

//   return (
//     <footer className="bg-muted/30">
//       {/* Newsletter + app badges + help line */}
//       <div className="bg-foreground/90 text-background">
//         <div className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-3 md:items-center">
//           {/* Newsletter */}
//           <div className="space-y-2">
//             <p className="text-sm font-medium">Get special discount on your inbox</p>
//             <form onSubmit={onSubscribe} className="flex max-w-sm items-center gap-2">
//               <Input
//                 type="email"
//                 placeholder="Your Email"
//                 aria-label="Your Email"
//                 className="bg-background text-foreground"
//                 required
//               />
//               <Button type="submit" variant="secondary">SEND</Button>
//             </form>
//           </div>

//           {/* App badges (hide if missing) */}
//           <div className="space-y-2">
//             <p className="text-sm font-medium">Experience the mobile app</p>
//             <div className="flex items-center gap-3">
//               <a href="#" aria-label="Get it on Google Play">
//                 <img
//                   src="/images/store/google-play.png"
//                   alt="Google Play"
//                   className="h-10"
//                   onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//                 />
//               </a>
//               <a href="#" aria-label="Download on the App Store">
//                 <img
//                   src="/images/store/app-store.png"
//                   alt="App Store"
//                   className="h-10"
//                   onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
//                 />
//               </a>
//             </div>
//           </div>

//           {/* Help line */}
//           <HelpLine />
//         </div>
//       </div>

//       {/* Links grid: keep nykaaish + Help, and add dynamic categories */}
//       <div className="section grid gap-10 lg:grid-cols-5">
//         {/* nykaaish brand/about */}
//         <div className="space-y-3">
//           <div className="text-xl font-semibold">TrendLine</div>
//           <ul className="space-y-2 text-sm text-muted-foreground">
//             <li><Link to="/about">Who are we?</Link></li>
//             <li><Link to="/careers">Careers</Link></li>
//             <li><Link to="/authenticity">Authenticity</Link></li>
//             <li><Link to="/press">Press</Link></li>
//             <li><Link to="/testimonials">Testimonials</Link></li>
//             <li><Link to="/csr">CSR</Link></li>
//             <li><Link to="/sustainability">Sustainability</Link></li>
//             <li><Link to="/disclosure">Responsible Disclosure</Link></li>
//             <li><Link to="/investors">Investor Relations</Link></li>
//           </ul>
//         </div>

//         {/* Help */}
//         <div className="space-y-3">
//           <h4 className="text-base font-medium">Help</h4>
//           <ul className="space-y-2 text-sm text-muted-foreground">
//             <li><Link to="/Contact">contact Us</Link></li>
//             <li><Link to="/about">About US</Link></li>
//             <li><Link to="/store-locator">Store Locator</Link></li>
//             <li><Link to="/returns">Cancellation & Return</Link></li>
//             <li><Link to="/shipping">Shipping & Delivery</Link></li>
//             <li><Link to="/sell">Sell on TrendLine</Link></li>
//           </ul>
//         </div>

//         {/* Dynamic category columns */}
//         {topBuckets.map(({ label, slug }) => {
//           let children: Category[] = [];
//           if (label === "Shoes & Bags") children = shoesAndBags;
//           else children = map[slug] || [];
//           const items = (children || []).slice(0, 10);

//           return (
//             <div key={slug} className="space-y-2">
//               <h4 className="text-base font-medium">{label}</h4>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 {loading && items.length === 0 ? (
//                   Array.from({ length: 6 }).map((_, i) => (
//                     <li key={i} className="h-3 w-28 animate-pulse rounded bg-muted" />
//                   ))
//                 ) : items.length > 0 ? (
//                   items.map((c) => (
//                     <li key={c.id}>
//                       <Link
//                         to={
//                           label === "Shoes & Bags"
//                             ? `/category/${c.slug}`
//                             : `/category/${slug}/${c.slug}`
//                         }
//                       >
//                         {c.name}
//                       </Link>
//                     </li>
//                   ))
//                 ) : (
//                   <li className="text-muted-foreground/70">Coming soon</li>
//                 )}
//               </ul>
//             </div>
//           );
//         })}
//       </div>

//       <div className="container mx-auto px-4">
//         <Separator />
//       </div>

//       {/* Contact strip */}
//       <ContactStrip />

//       {/* Bottom bar */}
//       <BottomBar />
//     </footer>
//   );
// }

// function HelpLine() {
//   return (
//     <div className="space-y-1">
//       <div className="flex items-center gap-2">
//         <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
//           <path d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.22c1.2.48 2.5.74 3.8.74a1 1 0 011 1V20a1 1 0 01-1 1C11.85 21 3 12.15 3 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.31.26 2.6.74 3.8a1 1 0 01-.22 1.1L6.6 10.8z" />
//         </svg>
//         <p className="text-sm font-medium">For any help, call us at 1800‑267‑4444</p>
//       </div>
//       <p className="text-xs opacity-90">Mon–Sat 8 AM–10 PM · Sun 10 AM–7 PM</p>
//     </div>
//   );
// }

// function ContactStrip() {
//   return (
//     <div className="container mx-auto px-4 py-5">
//       <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
//         <div className="flex flex-1 flex-wrap items-center gap-6">
//           <ContactPill
//             icon={
//               <span className="grid h-10 w-10 place-items-center rounded-full border">
//                 <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
//                   <path fill="currentColor" d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.22c1.2.48 2.5.74 3.8.74a1 1 0 011 1V20a1 1 0 01-1 1C11.85 21 3 12.15 3 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.31.26 2.6.74 3.8a1 1 0 01-.22 1.1L6.6 10.8z" />
//                 </svg>
//               </span>
//             }
//             title="Talk to us"
//             value="1800-123-1555"
//             href="tel:18001231555"
//           />
//           <ContactPill
//             icon={
//               <span className="grid h-10 w-10 place-items-center rounded-full border">
//                 <span className="text-lg">?</span>
//               </span>
//             }
//             title="Helpcentre"
//             value="help.TrendLine.com"
//             href="https://help.trendline.com"
//           />
//           <ContactPill
//             icon={
//               <span className="grid h-10 w-10 place-items-center rounded-full border">
//                 <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
//                   <path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v.4l10 6.25L22 6.4V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V18a2 2 0 002 2h12a2 2 0 002-2V8.2z"/>
//                 </svg>
//               </span>
//             }
//             title="Write to us"
//             value="help@TrendLine.com"
//             href="mailto:help@trendline.com"
//           />
//         </div>

//         {/* Socials */}
//         <div className="flex items-center gap-4 text-zinc-700">
//           <a href="https://facebook.com" aria-label="Facebook" className="hover:text-indigo-600">
//             <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
//               <path d="M13 22v-9h3l1-4h-4V7c0-1.03.34-2 2-2h2V1h-3c-3 0-5 2-5 5v3H7v4h2v9h4z" />
//             </svg>
//           </a>
//           <a href="https://x.com" aria-label="X" className="hover:text-indigo-600">
//             <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
//               <path d="M17.5 3h3l-7.5 8.5L21 21h-3l-6-7-6 7H3l7.5-8.5L3 3h3l6 7 5.5-7z" />
//             </svg>
//           </a>
//           <a href="https://instagram.com" aria-label="Instagram" className="hover:text-indigo-600">
//             <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
//               <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
//             </svg>
//           </a>
//         </div>
//       </div>
//       <div className="container mx-auto px-4">
//         <Separator />
//       </div>
//     </div>
//   );
// }

// function ContactPill({
//   icon,
//   title,
//   value,
//   href,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   value: string;
//   href: string;
// }) {
//   return (
//     <a href={href} className="flex items-center gap-3">
//       {icon}
//       <div className="leading-tight">
//         <p className="text-sm text-zinc-600">{title}</p>
//         <p className="text-base font-medium text-zinc-900">{value}</p>
//       </div>
//     </a>
//   );
// }

// function BottomBar() {
//   return (
//     <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row">
//       <p>© {new Date().getFullYear()} TrendLine. All rights reserved.</p>
//       <div className="flex items-center gap-3">
//         <Link to="/privacy">Privacy Policy</Link>
//         <span>•</span>
//         <Link to="/terms">Terms of Use</Link>
//         <span>•</span>
//         <Link to="/returns-policy">Returns Policy</Link>
//       </div>
//     </div>
//   );
// }
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, type Category } from "@/lib/api";

/* Top-level buckets */
const topBuckets: { label: string; slug: string }[] = [
  { label: "Women", slug: "women" },
  { label: "Men", slug: "men" },
  { label: "Kids", slug: "kids" },
  { label: "Shoes & Bags", slug: "footwear" }, // footwear + bags merged
  { label: "Beauty", slug: "beauty" },
];

export default function Footer() {
  const [map, setMap] = useState<Record<string, Category[]>>({});
  const [bagsChildren, setBagsChildren] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.allSettled(
          ["women", "men", "kids", "footwear", "bags", "beauty"].map((slug) =>
            api.categoryPage(slug).then((r) => ({ slug, children: r.children || [] }))
          )
        );
        if (!active) return;
        const m: Record<string, Category[]> = {};
        let bags: Category[] | null = null;
        for (const r of results) {
          if (r.status === "fulfilled") {
            const { slug, children } = r.value;
            if (slug === "bags") bags = children;
            else m[slug] = children;
          }
        }
        setMap(m);
        setBagsChildren(bags);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const shoesAndBags = useMemo<Category[]>(() => {
    const fw = map["footwear"] || [];
    const bg = bagsChildren || [];
    const list = [...fw, ...bg];
    const seen = new Set<string>();
    const dedup: Category[] = [];
    for (const c of list) {
      if (!c?.slug || seen.has(c.slug)) continue;
      seen.add(c.slug);
      dedup.push(c);
      if (dedup.length >= 10) break;
    }
    return dedup;
  }, [map, bagsChildren]);

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <footer className="bg-muted/30">
      {/* Newsletter + help line */}
      <div className="bg-foreground/90 text-background">
        <div className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-3 md:items-center">
          {/* Newsletter */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Get special discount on your inbox</p>
            <form onSubmit={onSubscribe} className="flex max-w-sm items-center gap-2">
              <Input type="email" placeholder="Your Email" aria-label="Your Email" className="bg-background text-foreground" required />
              <Button type="submit" variant="secondary">SEND</Button>
            </form>
          </div>

          {/* App badges */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Experience the mobile app</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Get it on Google Play">
                <img src="/images/store/google-play.png" alt="Google Play" className="h-10" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
              </a>
              <a href="#" aria-label="Download on the App Store">
                <img src="/images/store/app-store.png" alt="App Store" className="h-10" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
              </a>
            </div>
          </div>

          <HelpLine />
        </div>
      </div>

      {/* Links grid: only working items kept */}
      <div className="section grid gap-10 lg:grid-cols-5">
        {/* TrendLine (only working) */}
        <div className="space-y-3">
          <div className="text-xl font-semibold">TrendLine</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
          </ul>
        </div>

        {/* Dynamic category columns */}
        {topBuckets.map(({ label, slug }) => {
          let children: Category[] = [];
          if (label === "Shoes & Bags") children = shoesAndBags;
          else children = map[slug] || [];
          const items = (children || []).slice(0, 6); // tighter list for cleaner look

          return (
            <div key={slug} className="space-y-2">
              <h4 className="text-base font-medium">{label}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {loading && items.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => <li key={i} className="h-3 w-28 animate-pulse rounded bg-muted" />)
                ) : items.length > 0 ? (
                  items.map((c) => (
                    <li key={c.id}>
                      <Link to={label === "Shoes & Bags" ? `/category/${c.slug}` : `/category/${slug}/${c.slug}`}>{c.name}</Link>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground/70">Coming soon</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="container mx-auto px-4">
        <Separator />
      </div>

      <ContactStrip />

      <BottomBar />
    </footer>
  );
}

function HelpLine() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.22c1.2.48 2.5.74 3.8.74a1 1 0 011 1V20a1 1 0 01-1 1C11.85 21 3 12.15 3 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.31.26 2.6.74 3.8a1 1 0 01-.22 1.1L6.6 10.8z" />
        </svg>
        <p className="text-sm font-medium">For any help, call us at 1800‑267‑4444</p>
      </div>
      <p className="text-xs opacity-90">Mon–Sat 8 AM–10 PM · Sun 10 AM–7 PM</p>
    </div>
  );
}

function ContactStrip() {
  return (
    <div className="container mx-auto px-4 py-5">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-6">
          <ContactPill
            icon={<Circle><PhoneIcon /></Circle>}
            title="Talk to us"
            value="1800-123-1555"
            href="tel:18001231555"
          />
          <ContactPill
            icon={<Circle><span className="text-lg">?</span></Circle>}
            title="Helpcentre"
            value="help.trendline.com"
            href="https://help.trendline.com"
          />
          <ContactPill
            icon={<Circle><MailIcon /></Circle>}
            title="Write to us"
            value="help@trendline.com"
            href="mailto:help@trendline.com"
          />
          <ContactPill
            icon={<Circle><span className="text-lg">✉️</span></Circle>}
            title="Contact page"
            value="All options in one place"
            href="/contact"
          />
        </div>

        <div className="flex items-center gap-4 text-zinc-700">
          <a href="https://facebook.com" aria-label="Facebook" className="hover:text-indigo-600"><FacebookIcon /></a>
          <a href="https://x.com" aria-label="X" className="hover:text-indigo-600"><XIcon /></a>
          <a href="https://instagram.com" aria-label="Instagram" className="hover:text-indigo-600"><InstagramIcon /></a>
        </div>
      </div>
      <div className="container mx-auto px-0">
        <Separator />
      </div>
    </div>
  );
}

function ContactPill({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href: string }) {
  const isInternal = href.startsWith("/");
  const Inner: any = isInternal ? Link : "a";
  const props = isInternal ? { to: href } : { href };
  return (
    <Inner {...(props as any)} className="flex items-center gap-3">
      {icon}
      <div className="leading-tight">
        <p className="text-sm text-zinc-600">{title}</p>
        <p className="text-base font-medium text-zinc-900">{value}</p>
      </div>
    </Inner>
  );
}

function Circle({ children }: { children: React.ReactNode }) {
  return <span className="grid h-10 w-10 place-items-center rounded-full border">{children}</span>;
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.22c1.2.48 2.5.74 3.8.74a1 1 0 011 1V20a1 1 0 01-1 1C11.85 21 3 12.15 3 2a1 1 0 011-1h3.28a1 1 0 011 1c0 1.31.26 2.6.74 3.8a1 1 0 01-.22 1.1L6.6 10.8z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v.4l10 6.25L22 6.4V6a2 2 0 00-2-2zm0 4.2l-8 5-8-5V18a2 2 0 002 2h12a2 2 0 002-2V8.2z"/>
    </svg>
  );
}
function FacebookIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M13 22v-9h3l1-4h-4V7c0-1.03.34-2 2-2h2V1h-3c-3 0-5 2-5 5v3H7v4h2v9h4z" /></svg>;
}
function XIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M17.5 3h3l-7.5 8.5L21 21h-3l-6-7-6 7H3l7.5-8.5L3 3h3l6 7 5.5-7z" /></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm6.5-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" /></svg>;
}

function BottomBar() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row">
      <p>© {new Date().getFullYear()} TrendLine. All rights reserved.</p>
      <div className="flex items-center gap-3">
        <Link to="/privacy">Privacy Policy</Link>
        <span>•</span>
        <Link to="/terms">Terms of Use</Link>
        <span>•</span>
        <Link to="/returns-policy">Returns Policy</Link>
        <span>•</span>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
  );
}
