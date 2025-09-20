import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingBag, Menu, Search as SearchIcon } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div
        className="mx-auto flex h-16 items-center gap-3 pl-3 pr-1 sm:pl-4 sm:pr-2 lg:pl-4 lg:pr-1"
        role="navigation"
        aria-label="Primary"
      >
        {/* Mobile menu + logo */}
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger
              className="md:hidden p-2 rounded-md hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-5">
                <nav aria-label="Mobile">
                  <ul className="space-y-2">
                    {[
                      { to: "/", label: "Home" },
                      { to: "category/women", label: "Women" },
                      { to: "category/men", label: "Men" },
                      { to: "category/kids", label: "Kids" },
                      { to: "category/footwear", label: "Footwear" },
                      { to: "category/bags", label: "Bags" },
                      { to: "category/beauty", label: "Beauty" },
                      { to: "category/watches", label: "Watches" },
                    ].map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block rounded-md px-3 py-2 text-sm font-medium ${
                              isActive
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-700 hover:bg-zinc-50"
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="font-semibold text-2xl tracking-tight leading-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
            aria-label="Nykaaish home"
          >
            nykaaish
          </Link>
        </div>

        {/* Center search (desktop/tablet only) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar
              placeholder="Search for products, brands and more"
              className="w-full"
            />
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1 md:gap-4 pr-1 lg:pr-10">
          {/* Standalone search icon — desktop only */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex rounded-md"
            asChild
          >
            <Link to="/search" aria-label="Open search">
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button> */}

          {/* Sign up / Sign in */}
          <Button
            asChild
            className="hidden sm:inline-flex h-9 rounded-md px-3 sm:px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            <Link to="/auth" aria-label="Sign up or sign in">
              Sign up / Sign in
            </Link>
          </Button>

          {/* Favourites with label */}
          <Link
            to="/wishlist"
            className="grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
            aria-label="Favourites"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <span className="mt-0.5">Favourites</span>
          </Link>

          {/* Basket with label */}
          <Link
            to="/cart"
            className="relative grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
            aria-label="Basket"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="mt-0.5">Basket</span>
          </Link>
        </div>
      </div>

      {/* Mobile search below the row */}
      <div className="md:hidden px-3 pt-2 pb-3">
        <SearchBar
          placeholder="Search for products, brands and more"
          className="w-full"
        />
      </div>

      <Separator className="bg-zinc-100" />
    </header>
  );
}


