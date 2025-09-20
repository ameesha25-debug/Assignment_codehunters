import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export type SearchBarProps = {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmitQuery?: (q: string) => void;
};

export default function SearchBar({
  className,
  placeholder = "Search for products, brands and more",
  defaultValue = "",
  onSubmitQuery,
}: SearchBarProps) {
  const [q, setQ] = React.useState(defaultValue);

  return (
    <form
      role="search"
      aria-label="Site search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitQuery?.(q);
      }}
      className={[
        "group relative flex w-full items-center",
        // Base: darker than before
        "rounded-full border border-zinc-400 bg-zinc-200",
        // Hover: one step darker
        "hover:bg-zinc-300 hover:border-zinc-500",
        // Focus: white surface with clear ring for typing
        "focus-within:bg-white focus-within:border-zinc-500",
        "focus-within:ring-2 focus-within:ring-zinc-400/80",
        "transition-colors",
        "h-10 sm:h-11 px-2 sm:px-3",
        className || "",
      ].join(" ")}
    >
      {/* left icon inside the pill */}
      <span
        className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      >
        <Search className="h-4 w-4" />
      </span>

      <Input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={[
          "flex-1 !bg-transparent !border-0 !outline-none !ring-0 !shadow-none",
          "!focus:ring-0 !focus:border-0 !focus-visible:ring-0 !focus-visible:border-0",
          "placeholder:text-zinc-400 group-hover:placeholder:text-zinc-500",
          // padding accounts for the icon
          "text-sm sm:text-[15px] pl-8 sm:pl-9 pr-3",
          "[appearance:textfield] [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden",
        ].join(" ")}
      />
    </form>
  );
}
