import {  useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoutIcon, UserIcon, HeartIcon, OrdersIcon, AddressIcon, CreditIcon } from "@/assets/icons/account";
import type { ReactNode } from "react";

type Item = { label: string; to?: string; icon: ReactNode; action?: () => void };

export default function UserMenu({
  isAuthenticated,
  onLogout,
}: {
  isAuthenticated: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const loc = useLocation();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname, loc.search]);

  // Click outside to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!isAuthenticated) {
    // Compact button to open global auth drawer
    return (
      <button
        onClick={() =>
          window.dispatchEvent(new CustomEvent("open-auth", { detail: "signin" }))
        }
        className="rounded-full border p-2 hover:bg-zinc-50"
        aria-label="Sign in"
      >
        <UserIcon className="h-5 w-5" />
      </button>
    );
  }

  const items: Item[] = [
    { label: "My Account", to: "/account", icon: <UserIcon className="h-4 w-4" /> },
    { label: "Favourites", to: "/account/favourites", icon: <HeartIcon className="h-4 w-4" /> },
    { label: "Orders", to: "/account/orders", icon: <OrdersIcon className="h-4 w-4" /> },
    { label: "My Addresses", to: "/account/addresses", icon: <AddressIcon className="h-4 w-4" /> },
    { label: "My Credit", to: "/account/credit", icon: <CreditIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border p-2 hover:bg-zinc-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <UserIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-md border bg-white shadow-lg z-50"
        >
          <div className="py-2">
            {items.map((it) => (
              <Link
                key={it.label}
                to={it.to!}
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-left"
                onClick={() => setOpen(false)}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            ))}
            <div className="my-2 h-px bg-zinc-200" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              <LogoutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
