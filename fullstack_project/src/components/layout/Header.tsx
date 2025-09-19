import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingBag, User2, Menu, Search } from "lucide-react";
import SearchBar from "@/components/products/SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger className="md:hidden p-2" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="mt-6 space-y-3">
                <Link className="block text-sm font-medium" to="/">Home</Link>
                <Link className="block text-sm font-medium" to="/women">Women</Link>
                <Link className="block text-sm font-medium" to="/men">Men</Link>
                <Link className="block text-sm font-medium" to="/kids">Kids</Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="font-semibold text-xl tracking-tight">
            nykaaish
          </Link>
        </div>

        <div className="hidden md:flex flex-1">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link to="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart">
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Sign in / Sign up">
            <Link to="/auth">
              <User2 className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
}
