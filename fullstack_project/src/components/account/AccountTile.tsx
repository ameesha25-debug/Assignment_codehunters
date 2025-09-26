import { Link } from "react-router-dom";

export default function AccountTile({
  title,
  subtitle,
  to,
  action = "Manage",
  icon,
}: {
  title: string;
  subtitle?: string;
  to: string;
  action?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white/70 p-5 transition-all hover:border-indigo-300 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
          {icon ?? <span aria-hidden>👤</span>}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">{title}</p>
          {subtitle ? <p className="text-xs text-zinc-500">{subtitle}</p> : null}
        </div>
      </div>

      <Link
        to={to}
        className="inline-flex items-center gap-2 rounded-md border border-indigo-600 px-3.5 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
        aria-label={`${action} ${title}`}
      >
        <span>{action}</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
