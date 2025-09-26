import  type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function AccountLayout({ title = "My Account", children }: Props) {
  const location = useLocation();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-zinc-600" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:underline">Home</Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link to="/account" className="hover:underline">Account</Link>
            </li>
            {location.pathname !== "/account" ? (
              <>
                <li aria-hidden>›</li>
                <li className="text-zinc-900">
                  {title}
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
