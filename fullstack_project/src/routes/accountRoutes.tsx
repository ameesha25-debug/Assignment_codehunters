import type { RouteObject } from "react-router-dom";
import RequireUser from "@/components/account/RequireUser";
import AccountHub from "@/pages/AccountHub";
import ProfilePage from "@/pages/ProfilePage";
import AddressesPage from "@/pages/AddressesPage";
import MyCreditPage from "@/pages/MyCreditPage";
// Reuse your existing pages
import FavouritesPage from "@/pages/WishlistPage";
import OrdersPage from "@/pages/OrdersPage";

export const accountRoutes: RouteObject[] = [
  {
    path: "/account",
    element: (
      <RequireUser>
        <AccountHub />
      </RequireUser>
    ),
  },
  {
    path: "/account/profile",
    element: (
      <RequireUser>
        <ProfilePage />
      </RequireUser>
    ),
  },
  {
    path: "/account/favourites",
    element: (
      <RequireUser>
        <FavouritesPage />
      </RequireUser>
    ),
  },
  {
    path: "/account/orders",
    element: (
      <RequireUser>
        <OrdersPage />
      </RequireUser>
    ),
  },
  {
    path: "/account/addresses",
    element: (
      <RequireUser>
        <AddressesPage />
      </RequireUser>
    ),
  },
  {
    path: "/account/credit",
    element: (
      <RequireUser>
        <MyCreditPage />
      </RequireUser>
    ),
  },
];
