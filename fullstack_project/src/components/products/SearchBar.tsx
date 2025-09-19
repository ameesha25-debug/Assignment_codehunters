import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <form className="flex w-full max-w-2xl items-center gap-2" role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search for products, brands and more" aria-label="Search" />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
