import Header from "@/components/common/Header";
import CategoryBar from "@/components/common/CategoryBar";
import HeroCarousel from "@/components/home/HeroCarousel";
import PromoGrid from "@/components/home/PromoGrid";
import TrendyProducts from "@/components/home/TrendyProducts";
import EmailSubscribe from "@/components/forms/EmailSubscribe";
import Footer from "@/components/common/Footer";
// import type { Product } from "@/components/products/ProductCard";
import CategoryHeroCarousel from "@/components/home/CategoryHeroCarousel";
import BenefitsStrip from "@/components/home/BenefitsStrip";


// const carouselItems: Product[] = Array.from({ length: 8 }).map((_, i) => ({
//   id: `r-${i}`,
//   title: `Recommended ${i+1}`,
//   image: `/images/products/p${(i%8)+1}.jpg`,
//   price: 10 + i,
// }));

export default function HomePage() {
  return (
    <>
      <Header />
      <CategoryBar />
      <main className="space-y-10">
        <section className="container"><HeroCarousel /></section>
        <section className="container"><PromoGrid /></section>
        <section className="container"><TrendyProducts /></section>
         <section className="container"><BenefitsStrip  /></section>
        {/* <section className="container">
          <ProductCarousel title="Recommended for you" items={carouselItems} />
        </section> */}
        <section className="container"><EmailSubscribe /></section>
        
      </main>
      <Footer />
    </>
  );
}

