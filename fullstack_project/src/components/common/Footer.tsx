import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30">
      {/* Newsletter + app badges + help line */}
      <div className="bg-foreground/90 text-background">
        <div className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-3 md:items-center">
          {/* Newsletter */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Get special discount on your inbox</p>
            <form className="flex max-w-sm items-center gap-2">
              <Input
                type="email"
                placeholder="Your Email"
                aria-label="Your Email"
                className="bg-background text-foreground"
                required
              />
              <Button type="submit" variant="secondary">SEND</Button>
            </form>
          </div>

          {/* App badges (use your own images or links) */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Experience the mobile app</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Get it on Google Play">
                <img src="/images/store/google-play.png" alt="Google Play" className="h-10" />
              </a>
              <a href="#" aria-label="Download on the App Store">
                <img src="/images/store/app-store.png" alt="App Store" className="h-10" />
              </a>
            </div>
          </div>

          {/* Help line */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <p className="text-sm font-medium">
                For any help, call us at 1800‑267‑4444
              </p>
            </div>
            <p className="text-xs opacity-90">
              Monday to Saturday, 8 AM to 10 PM and Sunday, 10 AM to 7 PM
            </p>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="section grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div className="space-y-3">
          <div className="text-xl font-semibold">nykaaish</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">Who are we?</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/authenticity">Authenticity</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
            <li><Link to="/csr">CSR</Link></li>
            <li><Link to="/sustainability">Sustainability</Link></li>
            <li><Link to="/disclosure">Responsible Disclosure</Link></li>
            <li><Link to="/investors">Investor Relations</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="space-y-3">
          <h4 className="text-base font-medium">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faq">Frequently asked questions</Link></li>
            <li><Link to="/store-locator">Store Locator</Link></li>
            <li><Link to="/returns">Cancellation & Return</Link></li>
            <li><Link to="/shipping">Shipping & Delivery</Link></li>
            <li><Link to="/sell">Sell on Nykaaish</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-base font-medium">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/offers">Offer Zone</Link></li>
            <li><Link to="/new">New Launches</Link></li>
            <li><Link to="/men">Nykaa Man</Link></li>
            <li><Link to="/fashion">Nykaa Fashion</Link></li>
            <li><Link to="/pro">Nykaa Pro</Link></li>
            <li><Link to="/sitemap">Sitemap</Link></li>
          </ul>
        </div>

        {/* Top Categories */}
        <div className="space-y-3">
          <h4 className="text-base font-medium">Top Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/makeup">Makeup</Link></li>
            <li><Link to="/skin">Skin</Link></li>
            <li><Link to="/hair">Hair</Link></li>
            <li><Link to="/bath-body">Bath & Body</Link></li>
            <li><Link to="/appliances">Appliances</Link></li>
            <li><Link to="/mom-baby">Mom and Baby</Link></li>
            <li><Link to="/wellness">Health & Wellness</Link></li>
            <li><Link to="/fragrance">Fragrance</Link></li>
            <li><Link to="/natural">Natural</Link></li>
            <li><Link to="/luxe">Luxe</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Separator />
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} nykaaish. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <Link to="/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms">Terms of Use</Link>
          <span>•</span>
          <Link to="/returns-policy">Returns Policy</Link>
        </div>
      </div>
    </footer>
  );
}
