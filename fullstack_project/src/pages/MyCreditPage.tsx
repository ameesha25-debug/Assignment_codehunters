// src/pages/MyCreditPage.tsx
import AccountLayout from "@/components/account/AccountLayout";

export default function MyCreditPage() {
  // Replace with real data from API/store
  const creditTotal = 0;
  const parts = creditTotal.toLocaleString("en-IN");
  const isEmpty = creditTotal <= 0;

  return (
    <AccountLayout title="My Credit">
      {/* Center the content box in the viewport */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <p className="text-sm text-zinc-600 mb-6">
            View the available wallet and promotional credits usable at checkout. 
          </p>

          {/* Summary Card */}
          <section
            aria-labelledby="credit-balance-heading"
            className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-sm"
          >
            <div className="px-6 py-8 md:py-10 text-center">
              <h2 id="credit-balance-heading" className="sr-only">
                Credit balance 
              </h2>

              <div className="inline-flex items-baseline gap-2">
                <span className="text-emerald-700 text-2xl font-semibold">₹</span>
                <span className="text-5xl font-semibold tracking-tight text-emerald-800">
                  {parts}
                </span>
              </div>

              <div className="mt-3 text-base font-medium text-emerald-900">
                My Credit Balance 
              </div>
            </div>

            {/* Breakdown */}
            <div className="border-t border-emerald-200">
              <Row label="Refunds" value="₹0" hint="Refunds returned to wallet" />
              <Row label="TrendLine Credits" value="₹0" hint="Promotional credits" />
              <Row label="Return To Stores" value="₹0" hint="In-store returns credit" />
            </div>
          </section>

          {/* Empty state when balance is zero */}
          {isEmpty && <EmptyState />}
        </div>
      </div>
    </AccountLayout>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-emerald-50/50 focus-within:bg-emerald-50/70">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-zinc-900 truncate">{label}</span>
        {hint ? <Hint title={hint} /> : null}
      </div>
      <div className="text-zinc-900 font-medium">{value}</div>
    </div>
  );
}

function Hint({ title }: { title: string }) {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-[11px] text-zinc-600"
      title={title}
      aria-label={title}
    >
      ?
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          ₹
        </div>
        <div className="flex-1">
          <h3 className="text-zinc-900 font-semibold">No credits yet </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Earn credits from refunds, promotional campaigns, or in‑store returns. 
          </p>
        </div>
      </div>
    </div>
  );
}
