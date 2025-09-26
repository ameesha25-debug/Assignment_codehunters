import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Top breadcrumb */}
      <nav className="border-b bg-zinc-50">
        <div className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm text-zinc-600">
          <Link to="/" className="hover:text-yellow-600 hover:underline">Home</Link>
          <span>›</span>
          <span className="text-zinc-800">About us</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          About Us
        </h1>
        <p className="mb-4 text-xs text-zinc-500">India’s home for trends and style.</p>


    <img
  src="/src/assets/fashion.jpg"
  alt="TrendLine flagship store"
  className="h-56 w-full object-cover sm:h-80 lg:h-[380px]"
/>


        <div className="overflow-hidden rounded-xl border">
          <img
            src="/images/brand/about-hero.jpg"
            alt="TrendLine store and customers"
            className="h-56 w-full object-cover sm:h-80 lg:h-[380px]"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        </div>
      </section>

      {/* Mission + story */}
      <section className="container mx-auto grid gap-8 px-4 pb-10 sm:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            TrendLine is India’s premier fashion destination for the latest trends and hottest styles.
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            TrendLine curates a wide selection of great products from leading national and international brands.
            From everyday essentials to runway-inspired looks, discover apparel, footwear, handbags, fashion
            accessories, beauty products and more — all under one roof.
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Built by a team obsessed with quality and value, TrendLine blends sharp merchandising, seamless
            digital experiences, and fast, reliable delivery to make shopping delightfully simple.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard value="15k+" label="Customers" desc="Walk into TrendLine every week across India." />
          <StatCard value="14M+" label="Products sold" desc="Shipped each year through our network." />
          <StatCard value="50+" label="Stores" desc="Partner retail presence across major cities." />
          <StatCard value="2.9M" label="sq.ft retail" desc="Total floor space with avg 45k sq.ft / site." />
        </div>
      </section>

      {/* Ethos */}
      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-xl border p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-zinc-900">What we stand for</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            <li>• Authentic brands, verified products, fair prices.</li>
            <li>• Inclusive sizing, diverse styles, and trend-right edits every season.</li>
            <li>• Responsible packaging and a growing sustainable assortment.</li>
            <li>• Helpful support, easy returns, and reliable delivery options.</li>
          </ul>
        </div>

        {/* CTA row */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <CTA to="/category/women" title="Shop Women" />
          <CTA to="/category/men" title="Shop Men" />
          <CTA to="/contact" title="Contact us" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, desc }: { value: string; label: string; desc: string }) {
  return (
    <div className="rounded-xl border p-5">
      <div className="text-2xl font-bold text-zinc-900">{value}</div>
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      <p className="mt-1 text-xs text-zinc-600">{desc}</p>
    </div>
  );
}

function CTA({ to, title }: { to: string; title: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center rounded-lg border border-indigo-600 px-4 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
    >
      {title}
    </Link>
  );
}
