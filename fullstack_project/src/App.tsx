import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import CategoryPLP from "@/pages/CategoryPLP";
import AuthPage from "@/pages/AuthPage";
import ProductPDP from "@/pages/ProductPDP";
import SearchPLP from "@/pages/SearchPLP";
import BasketPage from "@/pages/BasketPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import WishlistPage from "@/pages/WishlistPage";
import AccountHub from "@/pages/AccountHub";
import ProfilePage from "@/pages/ProfilePage";
import AddressesPage from "@/pages/AddressesPage";
import MyCreditPage from "@/pages/MyCreditPage";
import RequireUser from "@/components/account/RequireUser";
import ContactPage from "@/pages/ContactUsPage";
import AboutPage from "@/pages/AboutPage";

export default function App() {
  console.log("APP is rendered");
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/category/:slug" element={<CategoryPLP />} />
      <Route
        path="/category/:parentSlug/:childSlug"
        element={<CategoryPLP />}
      />
      <Route path="/product/:id" element={<ProductPDP />} />
      <Route path="/search" element={<SearchPLP />} />
      <Route path="/basket" element={<BasketPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Orders (existing) */}
      <Route
        path="/orders"
        element={
          <RequireUser>
            <OrdersPage />
          </RequireUser>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireUser>
            <OrderDetailsPage />
          </RequireUser>
        }
      />

      {/* Wishlist (existing) now protected and aliased to account */}
      {/* Public wishlist page self-handles signed-out state (like Basket) */}
      <Route path="/wishlist" element={<WishlistPage />} />

      {/* New Account hub + children (same pages as header dropdown) */}
      <Route
        path="/account"
        element={
          <RequireUser>
            <AccountHub />
          </RequireUser>
        }
      />
      <Route
        path="/account/profile"
        element={
          <RequireUser>
            <ProfilePage />
          </RequireUser>
        }
      />
      <Route
        path="/account/favourites"
        element={
          <RequireUser>
            <WishlistPage />
          </RequireUser>
        }
      />
      <Route
        path="/account/orders"
        element={
          <RequireUser>
            <OrdersPage />
          </RequireUser>
        }
      />
      <Route
        path="/account/addresses"
        element={
          <RequireUser>
            <AddressesPage />
          </RequireUser>
        }
      />
      <Route
        path="/account/credit"
        element={
          <RequireUser>
            <MyCreditPage />
          </RequireUser>
        }
      />
    </Routes>
  );
}
