// import { useEffect, useState } from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Separator } from "@/components/ui/separator";
// import { Heart, ShoppingBag, Menu } from "lucide-react";
// import SearchBar from "@/components/common/SearchBar";

// import SignInForm from "@/components/forms/SignInForm";
// import SignUpForm from "@/components/forms/SignUpForm";
// import { useAuth } from "@/lib/auth";
// import { api } from "@/lib/api";
// import { cart } from "@/lib/cart";
// import { wishlist } from "@/lib/wishlist";

// function AccountMenu({
//   name,
//   credit = 0,
//   onNavigate,
//   onSignOut,
// }: {
//   name: string;
//   credit?: number;
//   onNavigate: (to: string) => void;
//   onSignOut: () => Promise<void>;
// }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="rounded-full border p-2 hover:bg-zinc-50"
//         aria-haspopup="menu"
//         aria-expanded={open}
//         aria-label="Account menu"
//         title={name}
//       >
//         <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//           <circle cx="12" cy="8" r="4" stroke="currentColor" />
//           <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" />
//         </svg>
//       </button>

//       {open && (
//         <div
//           role="menu"
//           className="absolute right-0 mt-2 w-72 rounded-md border bg-white shadow-lg z-50"
//           onMouseLeave={() => setOpen(false)}
//         >
//           <div className="py-2">
//             {[
//               { label: "My Account", to: "/account" },
//               { label: "Favourites", to: "/wishlist" },
//               { label: "Order History", to: "/orders" },
//               { label: "My Addresses", to: "/addresses" },
//               { label: "Payment", to: "/payment" },
//               { label: `My Credit ₹${credit ?? 0}`, to: "/wallet" },
//               { label: "Communication", to: "/communication" },
//               { label: "Reviews", to: "/reviews" },
//               { label: "Click & Collect", to: "/click-collect" },
//               { label: "Landmark Rewards", to: "/rewards" },
//             ].map((item) => (
//               <button
//                 key={item.label}
//                 role="menuitem"
//                 className="w-full text-left px-4 py-2 hover:bg-zinc-50"
//                 onClick={() => {
//                   setOpen(false);
//                   onNavigate(item.to);
//                 }}
//               >
//                 {item.label}
//               </button>
//             ))}
//             <div className="my-2 h-px bg-zinc-200" />
//             <button
//               role="menuitem"
//               className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
//               onClick={async () => {
//                 await onSignOut();
//                 setOpen(false);
//               }}
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Header() {
//   const [authOpen, setAuthOpen] = useState(false);
//   const [mode, setMode] = useState<"signin" | "signup">("signin");
//   const [cartCount, setCartCount] = useState<number>(0);
//   const [wishCount, setWishCount] = useState<number>(0);
//   const navigate = useNavigate();

//   async function handleSearch(q: string) {
//     const query = q.trim();
//     if (!query) return;
//     const res = await api.resolveSearch(query);
//     switch (res.type) {
//       case "category":
//         navigate(`/category/${res.category.slug}`);
//         break;
//       case "subcategory":
//         navigate(`/category/${res.parent.slug}/${res.category.slug}`);
//         break;
//       case "size":
//         navigate(`/search/size/${encodeURIComponent(res.size)}`);
//         break;
//       case "products":
//         navigate(`/search?q=${encodeURIComponent(query)}`);
//         break;
//       case "none":
//       default:
//         navigate(`/search?q=${encodeURIComponent(query)}`);
//         break;
//     }
//   }

//   const { user, signOut, reloadUser } = useAuth() as ReturnType<
//     typeof useAuth
//   > & {
//     reloadUser?: () => Promise<void>;
//   };

//   const onSignOut = async () => {
//     await signOut();
//     navigate("/");
//     setCartCount(0);
//     setWishCount(0);
//   };

//   // Open auth drawer from anywhere
//   useEffect(() => {
//     function onOpenAuth(e: Event) {
//       setAuthOpen(true);
//       const detail = (e as CustomEvent).detail as
//         | "signin"
//         | "signup"
//         | undefined;
//       setMode(detail || "signin");
//     }
//     window.addEventListener("open-auth" as any, onOpenAuth);
//     return () => window.removeEventListener("open-auth" as any, onOpenAuth);
//   }, []);

//   // Load cart and wishlist counts when user changes
//   useEffect(() => {
//     let done = false;
//     async function loadCounts() {
//       if (!user) {
//         setCartCount(0);
//         setWishCount(0);
//         return;
//       }
//       try {
//         const c = await cart.get();
//         if (!done) {
//           const distinctCount = Array.from(
//             new Set(
//               c.items
//                 .filter((it) => (it.qty || 0) > 0)
//                 .map((it) => it.product_id)
//             )
//           ).length;
//           setCartCount(distinctCount);
//         }
//       } catch {
//         if (!done) setCartCount(0);
//       }
//       try {
//         const w = await wishlist.get();
//         if (!done) setWishCount(w.items?.length ?? 0);
//       } catch {
//         if (!done) setWishCount(0);
//       }
//     }
//     loadCounts();
//     return () => {
//       done = true;
//     };
//   }, [user]);

//   // Refresh counts on explicit updates from elsewhere
//   useEffect(() => {
//     let cancelled = false;
//     async function refreshCart() {
//       if (!user) {
//         setCartCount(0);
//         return;
//       }
//       try {
//         const c = await cart.get();
//         if (!cancelled) {
//           const distinctCount = Array.from(
//             new Set(
//               c.items
//                 .filter((it) => (it.qty || 0) > 0)
//                 .map((it) => it.product_id)
//             )
//           ).length;
//           setCartCount(distinctCount);
//         }
//       } catch {
//         if (!cancelled) setCartCount(0);
//       }
//     }
//     function onCartUpdated() {
//       refreshCart();
//     }
//     window.addEventListener("cart-updated", onCartUpdated);
//     return () => {
//       cancelled = true;
//       window.removeEventListener("cart-updated", onCartUpdated);
//     };
//   }, [user]);

//   useEffect(() => {
//     let cancelled = false;
//     async function refreshWishlist() {
//       if (!user) {
//         setWishCount(0);
//         return;
//       }
//       try {
//         const w = await wishlist.get();
//         if (!cancelled) setWishCount(w.items?.length ?? 0);
//       } catch {
//         if (!cancelled) setWishCount(0);
//       }
//     }
//     function onWishlistUpdated() {
//       refreshWishlist();
//     }
//     window.addEventListener("wishlist-updated", onWishlistUpdated);
//     return () => {
//       cancelled = true;
//       window.removeEventListener("wishlist-updated", onWishlistUpdated);
//     };
//   }, [user]);

//   const handleSignIn = async (form: { mobile: string; password: string }) => {
//     await api.loginUser(form.mobile, form.password);
//     setAuthOpen(false);
//     if (reloadUser) {
//       await reloadUser();
//     } else {
//       window.location.reload();
//     }
//   };

//   const handleSignUp = async (form: { mobile: string; password: string }) => {
//     await api.registerUser(form.mobile, form.password);
//     setAuthOpen(false);
//     if (reloadUser) {
//       await reloadUser();
//     } else {
//       window.location.reload();
//     }
//   };

//   return (
//     <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
//       <div
//         className="mx-auto flex h-16 items-center gap-3 pl-3 pr-1 sm:pl-4 sm:pr-2 lg:pl-4 lg:pr-1"
//         role="navigation"
//         aria-label="Primary"
//       >
//         {/* Mobile menu + logo */}
//         <div className="flex items-center gap-1">
//           <Sheet>
//             <SheetTrigger
//               className="md:hidden p-2 rounded-md hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
//               aria-label="Open menu"
//             >
//               <Menu className="h-5 w-5" aria-hidden="true" />
//             </SheetTrigger>
//             <SheetContent side="left" className="w-80 p-0">
//               <div className="p-5">
//                 <nav aria-label="Mobile">
//                   <ul className="space-y-2">
//                     {[
//                       { to: "/", label: "Home" },
//                       { to: "category/women", label: "Women" },
//                       { to: "category/men", label: "Men" },
//                       { to: "category/kids", label: "Kids" },
//                       { to: "category/footwear", label: "Footwear" },
//                       { to: "category/bags", label: "Bags" },
//                       { to: "category/beauty", label: "Beauty" },
//                       { to: "category/watches", label: "Watches" },
//                     ].map((item) => (
//                       <li key={item.to}>
//                         <NavLink
//                           to={item.to}
//                           className={({ isActive }) =>
//                             `block rounded-md px-3 py-2 text-sm font-medium ${
//                               isActive
//                                 ? "bg-zinc-100 text-zinc-900"
//                                 : "text-zinc-700 hover:bg-zinc-50"
//                             }`
//                           }
//                         >
//                           {item.label}
//                         </NavLink>
//                       </li>
//                     ))}
//                   </ul>
//                 </nav>
//               </div>
//             </SheetContent>
//           </Sheet>

//           <Link
//             to="/"
//             className="font-semibold text-2xl tracking-tight leading-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
//             aria-label="Nykaaish home"
//           >
//             nykaaish
//           </Link>
//         </div>

//         {/* Center search */}
//         <div className="hidden md:flex flex-1 justify-center">
//           <div className="w-full max-w-2xl">
//             <SearchBar
//               placeholder="Search for products, brands and more"
//               className="w-full"
//               onSubmitQuery={handleSearch}
//             />
//           </div>
//         </div>

//         {/* Right cluster */}
//         <div className="ml-auto flex items-center gap-1 md:gap-4 pr-1 lg:pr-10">
//           {!user ? (
//             <Button
//               onClick={() => {
//                 setAuthOpen(true);
//                 setMode("signin");
//               }}
//               className="hidden sm:inline-flex h-9 rounded-md px-3 sm:px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
//             >
//               Sign up / Sign in
//             </Button>
//           ) : (
//             <AccountMenu
//               name={user.name || (user as any).mobile || "Account"}
//               credit={(user as any).credit ?? 0}
//               onNavigate={(to) => navigate(to)}
//               onSignOut={onSignOut}
//             />
//           )}

//           <Link
//             to="/wishlist"
//             className="relative grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
//             aria-label="Favourites"
//           >
//             <div className="relative">
//               <Heart className="h-5 w-5" aria-hidden="true" />
//               {wishCount > 0 && (
//                 <span className="absolute -right-2 -top-2 min-w-[16px] rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white text-center">
//                   {wishCount}
//                 </span>
//               )}
//             </div>
//             <span className="mt-0.5">Favourites</span>
//           </Link>

//           <Link
//             to="/basket"
//             className="relative grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
//             aria-label="Basket"
//           >
//             <div className="relative">
//               <ShoppingBag className="h-5 w-5" aria-hidden="true" />
//               {cartCount > 0 && (
//                 <span className="absolute -right-2 -top-2 min-w-[16px] rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white text-center">
//                   {cartCount}
//                 </span>
//               )}
//             </div>
//             <span className="mt-0.5">Basket</span>
//           </Link>
//         </div>
//       </div>

//       {/* Mobile search */}
//       <div className="md:hidden px-3 pt-2 pb-3">
//         <SearchBar
//           placeholder="Search for products, brands and more"
//           className="w-full"
//           onSubmitQuery={handleSearch}
//         />
//       </div>

//       <Separator className="bg-zinc-100" />

//       {/* Auth Drawer */}
//       {!user && (
//         <Sheet open={authOpen} onOpenChange={setAuthOpen}>
//           <SheetContent side="right" className="w-full max-w-md p-6">
//             <h2 className="text-xl font-semibold mb-4">
//               {mode === "signin"
//                 ? "Sign In to your account"
//                 : "Create a new account"}
//             </h2>

//             {mode === "signin" ? (
//               <SignInForm
//                 onSwitch={() => setMode("signup")}
//                 onSubmit={handleSignIn}
//               />
//             ) : (
//               <SignUpForm
//                 onSwitch={() => setMode("signin")}
//                 onSubmit={handleSignUp}
//               />
//             )}
//           </SheetContent>
//         </Sheet>
//       )}
//     </header>
//   );
// }
import { useEffect, useState } from "react";
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
import { cart } from "@/lib/cart";

function AccountMenu({
  name,
  credit = 0,
  onNavigate,
  onSignOut,
}: {
  name: string;
  credit?: number;
  onNavigate: (to: string) => void;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border p-2 hover:bg-zinc-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={name}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" />
          <path d="M4 20c1.8-3.2 5-5 8-5s6.2 1.8 8 5" stroke="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-md border bg-white shadow-lg z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="py-2">
            {[
              { label: "My Account", to: "/account" },
              { label: "Favourites", to: "/wishlist" },
              { label: "Order History", to: "/orders" },
              { label: "My Addresses", to: "/addresses" },
              { label: "Payment", to: "/payment" },
              { label: `My Credit ₹${credit ?? 0}`, to: "/wallet" },
              { label: "Communication", to: "/communication" },
              { label: "Reviews", to: "/reviews" },
              { label: "Click & Collect", to: "/click-collect" },
              { label: "Landmark Rewards", to: "/rewards" },
            ].map((item) => (
              <button
                key={item.label}
                role="menuitem"
                className="w-full text-left px-4 py-2 hover:bg-zinc-50"
                onClick={() => {
                  setOpen(false);
                  onNavigate(item.to);
                }}
              >
                {item.label}
              </button>
            ))}
            <div className="my-2 h-px bg-zinc-200" />
            <button
              role="menuitem"
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              onClick={async () => {
                await onSignOut();
                setOpen(false);
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [cartCount, setCartCount] = useState<number>(0);
  const navigate = useNavigate();

  async function handleSearch(q: string) {
    const query = q.trim();
    if (!query) return;
    const res = await api.resolveSearch(query);
    switch (res.type) {
      case "category":
        navigate(`/category/${res.category.slug}`);
        break;
      case "subcategory":
        navigate(`/category/${res.parent.slug}/${res.category.slug}`);
        break;
      case "size":
        navigate(`/search/size/${encodeURIComponent(res.size)}`);
        break;
      case "products":
        navigate(`/search?q=${encodeURIComponent(query)}`);
        break;
      case "none":
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
        break;
    }
  }

  const { user, signOut, reloadUser } = useAuth() as ReturnType<
    typeof useAuth
  > & {
    reloadUser?: () => Promise<void>;
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/");
    setCartCount(0);
  };

  // Open auth drawer from anywhere
  useEffect(() => {
    function onOpenAuth(e: Event) {
      setAuthOpen(true);
      const detail = (e as CustomEvent).detail as
        | "signin"
        | "signup"
        | undefined;
      setMode(detail || "signin");
    }
    window.addEventListener("open-auth" as any, onOpenAuth);
    return () => window.removeEventListener("open-auth" as any, onOpenAuth);
  }, []);

  // Load cart count when user changes
  useEffect(() => {
    let done = false;
    async function loadCartCount() {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const c = await cart.get();
        if (!done) {
          const distinctCount = Array.from(
            new Set(
              c.items
                .filter((it) => (it.qty || 0) > 0)
                .map((it) => it.product_id)
            )
          ).length;
          setCartCount(distinctCount);
        }
      } catch {
        if (!done) setCartCount(0);
      }
    }
    loadCartCount();
    return () => {
      done = true;
    };
  }, [user]);

  // Refresh cart count on explicit updates from elsewhere
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const c = await cart.get();
        if (!cancelled) {
          const distinctCount = Array.from(
            new Set(
              c.items
                .filter((it) => (it.qty || 0) > 0)
                .map((it) => it.product_id)
            )
          ).length;
          setCartCount(distinctCount);
        }
      } catch {
        if (!cancelled) setCartCount(0);
      }
    }
    function onCartUpdated() {
      refresh();
    }
    window.addEventListener("cart-updated", onCartUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", onCartUpdated);
    };
  }, [user]);

  const handleSignIn = async (form: { mobile: string; password: string }) => {
    await api.loginUser(form.mobile, form.password);
    setAuthOpen(false);
    if (reloadUser) {
      await reloadUser();
    } else {
      window.location.reload();
    }
  };

  const handleSignUp = async (form: { mobile: string; password: string }) => {
    await api.registerUser(form.mobile, form.password);
    setAuthOpen(false);
    if (reloadUser) {
      await reloadUser();
    } else {
      window.location.reload();
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

        {/* Center search */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar
              placeholder="Search for products, brands and more"
              className="w-full"
              onSubmitQuery={handleSearch}
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
            <AccountMenu
              name={user.name || (user as any).mobile || "Account"}
              credit={(user as any).credit ?? 0}
              onNavigate={(to) => navigate(to)}
              onSignOut={onSignOut}
            />
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
            to="/basket"
            className="relative grid place-items-center px-2 py-1 text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded"
            aria-label="Basket"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-[16px] rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white text-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="mt-0.5">Basket</span>
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-3 pt-2 pb-3">
        <SearchBar
          placeholder="Search for products, brands and more"
          className="w-full"
          onSubmitQuery={handleSearch}
        />
      </div>

      <Separator className="bg-zinc-100" />

      {/* Auth Drawer */}
      {!user && (
        <Sheet open={authOpen} onOpenChange={setAuthOpen}>
          <SheetContent side="right" className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {mode === "signin"
                ? "Sign In to your account"
                : "Create a new account"}
            </h2>

            {mode === "signin" ? (
              <SignInForm
                onSwitch={() => setMode("signup")}
                onSubmit={handleSignIn}
              />
            ) : (
              <SignUpForm
                onSwitch={() => setMode("signin")}
                onSubmit={handleSignUp}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
