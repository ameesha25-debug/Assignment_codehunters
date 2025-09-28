import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import AccountLayout from "@/components/account/AccountLayout";

// Use existing site chrome
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TextCategoryBar, { type Item } from "@/components/common/TextCategoryBar";

// If categories are already sourced from state/store, replace this with that source
const TOP_CATEGORIES: Item[] = [
  { name: "Women", slug: "women" },
  { name: "Men", slug: "men" },
  { name: "Kids", slug: "kids" },
  { name: "Footwear", slug: "footwear" },
  { name: "Bags", slug: "bags" },
  { name: "Beauty", slug: "beauty" },
  { name: "Watches", slug: "watches" },
];

export default function AccountHub() {
  const { user } = useAuth() as ReturnType<typeof useAuth>;
  const fullName = (user?.name || "").trim() || "Your account";
  const mobile = (user as any)?.mobile || (user as any)?.phone || "Not added";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Keep the same TextCategoryBar API already implemented */}
      <TextCategoryBar
        kind="level1"
        items={TOP_CATEGORIES}
        basePath="/category"
      />

      <main role="main" className="flex-1">
        <AccountLayout title="Account">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header card */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-indigo-50 to-white p-6 sm:p-7">
              <h1 className="text-xl font-semibold text-zinc-900">{fullName}</h1>
              <p className="text-sm text-zinc-600">Mobile: {mobile}</p>
            </div>

            {/* Big tiles grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <BigTile
                title="Profile"
                subtitle="Name, DOB, preferences"
                to="/account/profile"
                icon={<span aria-hidden>📝</span>}
              />
              <BigTile
                title="Addresses"
                subtitle="Add or edit addresses"
                to="/account/addresses"
                icon={<span aria-hidden>🏠</span>}
              />
              <BigTile
                title="Orders"
                subtitle="Track and manage orders"
                to="/account/orders"
                icon={<span aria-hidden>🧾</span>}
              />
              <BigTile
                title="Wishlist"
                subtitle="Quickly find saved items"
                to="/account/favourites"
                icon={<span aria-hidden>💖</span>}
              />
            </div>
          </div>
        </AccountLayout>
      </main>

      <Footer />
    </div>
  );
}

function BigTile({
  title,
  subtitle,
  to,
  icon,
}: {
  title: string;
  subtitle?: string;
  to: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm ring-1 ring-transparent transition-all hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-700">
            {icon ?? <span aria-hidden>📦</span>}
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            {subtitle ? <p className="text-sm text-zinc-600">{subtitle}</p> : null}
          </div>
        </div>
        <Link
          to={to}
          className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
          aria-label={`Manage ${title}`}
        >
          Manage
        </Link>
      </div>
    </div>
  );
}
