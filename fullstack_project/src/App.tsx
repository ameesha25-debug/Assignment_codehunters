import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import CategoryBar from "./components/common/CategoryBar"; // your image grid homepage bar
import CategoryPLP from "./pages/CategoryPLP";
import AuthPage from "./pages/AuthPage";
import ProductPDP from "./pages/ProductPDP";
import SearchPLP from "@/pages/SearchPLP";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/" element={<CategoryBar />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/category/:slug" element={<CategoryPLP />} />
      <Route
        path="/category/:parentSlug/:childSlug"
        element={<CategoryPLP />}
      />
      <Route path="/product/:id" element={<ProductPDP />} />
      <Route path="/search" element={<SearchPLP />} />
    </Routes>
  );
}
