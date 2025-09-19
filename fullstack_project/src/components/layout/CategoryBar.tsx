import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const cats = [
  { slug: "women", label: "Women", img: "/images/categories/women.png" },
  { slug: "men", label: "Men", img: "/images/categories/men.png" },
  { slug: "kids", label: "Kids", img: "/images/categories/kids.png" },
  {
    slug: "footwear",
    label: "Footwear",
    img: "/images/categories/footwear.png",
  },
  { slug: "bags", label: "Bags", img: "/images/categories/bags.png" },
  { slug: "beauty", label: "Beauty", img: "/images/categories/beauty.png" },
  { slug: "watches", label: "Watches", img: "/images/categories/watches.png" },
];

export default function CategoryBar() {
  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="hidden md:grid grid-cols-7 gap-4">
          {cats.map((c) => (
            <Link
              key={c.slug}
              to={`/c/${c.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              <img
                src={c.img}
                alt={c.label}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-border shadow-sm group-hover:ring-primary transition"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                {c.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="md:hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="categories">
              <AccordionTrigger className="text-sm">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {cats.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/c/${c.slug}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <img
                        src={c.img}
                        alt={c.label}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
                      />
                      <span className="text-xs">{c.label}</span>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
