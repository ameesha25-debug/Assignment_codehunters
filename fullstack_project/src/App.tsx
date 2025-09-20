import {  Routes, Route } from 'react-router-dom';
import HomePage from "@/pages/HomePage";
import CategoryBar from './components/common/CategoryBar'; // your image grid homepage bar
import CategoryPLP from './pages/CategoryPLP';
import SubcategoryPLP from './pages/SubcategoryPLP'
export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/" element={<CategoryBar />} />
        <Route path="/category/:slug" element={<CategoryPLP />} />
        <Route path="/category/:parentSlug/:subSlug" element={<SubcategoryPLP />} />
      </Routes>
  );
}



