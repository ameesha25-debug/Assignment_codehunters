import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import CategoryPLP from '@/pages/CategoryPLP';
import AuthPage from '@/pages/AuthPage';
import ProductPDP from '@/pages/ProductPDP';
import SearchPLP from '@/pages/SearchPLP';
import BasketPage from '@/pages/BasketPage'; // NEW
import WishlistPage from '@/pages/WishlistPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/category/:slug" element={<CategoryPLP />} />
      <Route path="/category/:parentSlug/:childSlug" element={<CategoryPLP />} />
      <Route path="/product/:id" element={<ProductPDP />} />
      <Route path="/search" element={<SearchPLP />} />
      <Route path="/basket" element={<BasketPage />} /> {/* NEW */}
      {/* Optional alias if header or links use /cart */}
      <Route path="/cart" element={<BasketPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
    </Routes>
  );
}
