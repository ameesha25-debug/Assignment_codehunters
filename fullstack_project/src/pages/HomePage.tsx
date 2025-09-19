import Header from "@/components/layout/Header";
import CategoryBar from "@/components/layout/CategoryBar";
import HeroCarousel from "@/components/home/HeroCarousel";
import PromoGrid from "@/components/home/PromoGrid";
import TrendyProducts from "@/components/home/TrendyProducts";
import ProductCarousel from "@/components/products/ProductCarousel";
import EmailSubscribe from "@/components/forms/EmailSubscribe";
import Footer from "@/components/layout/Footer";
import type { Product } from "@/components/products/ProductCard";

const carouselItems: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `r-${i}`,
  title: `Recommended ${i+1}`,
  image: `/images/products/p${(i%8)+1}.jpg`,
  price: 10 + i,
}));

export default function HomePage() {
  return (
    <>
      <Header />
      <CategoryBar />
      <HeroCarousel />
      <PromoGrid />
      <TrendyProducts />
      <ProductCarousel title="Recommended for you" items={carouselItems} />
      <EmailSubscribe />
      <Footer />
    </>
  );
}
