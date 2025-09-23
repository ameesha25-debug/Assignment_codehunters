import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingBag, Menu } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";
import SignInForm from "@/components/forms/SignInForm";
import SignUpForm from "@/components/forms/SignUpForm";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = () => {
    signOut();
    navigate("/");
  };

  // Use shared API helpers to avoid duplicate URLs and parsing issues
  const handleSignIn = async (form: { mobile: string; password: string }) => {
    try {
      const data = await api.loginUser(form.mobile, form.password);
      if (data?.token) {
        signIn(data.token, data.user);
        alert("Login successful");
        setAuthOpen(false);
        navigate("/", { replace: true });
      } else {
        alert(data?.message || "Login failed");
      }
    } catch (e: any) {
      alert(e?.message || "Login failed");
    }
  };

  const handleSignUp = async (form: { mobile: string; password: string }) => {
    try {
      const data = await api.registerUser(form.mobile, form.password);
      if (data?.token) {
        signIn(data.token, data.user);
        alert("Registration successful");
        setAuthOpen(false);
        navigate("/", { replace: true });
      } else {
        alert(data?.message || "Registration failed");
      }
    } catch (e: any) {
      alert(e?.message || "Registration failed");
    }
  };

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
          {!user ? (
            <Button
              onClick={() => {
                setAuthOpen(true);
                setMode("signin");
              }}
              className="hidden sm:inline-flex h-9 rounded-md px-3 sm:px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              Sign up / Sign in
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/account")}
                className="rounded-full border p-2"
                aria-label="Account"
                title={user.name || user.mobile || "Account"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" />
                  <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" />
                </svg>
              </button>
              <button
                onClick={onSignOut}
                className="rounded border px-3 py-1.5 text-sm"
              >
                Sign out
              </button>
            </div>
          )}

          <Link
            to="/wishlist"
            className="grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
            aria-label="Favourites"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <span className="mt-0.5">Favourites</span>
          </Link>

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

      {/* Mobile search */}
      <div className="md:hidden px-3 pt-2 pb-3">
        <SearchBar
          placeholder="Search for products, brands and more"
          className="w-full"
        />
      </div>

      <Separator className="bg-zinc-100" />

      {/* Auth Drawer */}
      {!user && (
        <Sheet open={authOpen} onOpenChange={setAuthOpen}>
          <SheetContent side="right" className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {mode === "signin" ? "Sign In to your account" : "Create a new account"}
            </h2>

            {mode === "signin" ? (
              <>
                <SignInForm onSwitch={() => setMode("signup")} onSubmit={handleSignIn} />
                <p className="mt-4 text-sm">
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-blue-600 underline"
                    type="button"
                  >
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignUpForm onSwitch={() => setMode("signin")} onSubmit={handleSignUp} />
                <p className="mt-4 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-blue-600 underline"
                    type="button"
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
