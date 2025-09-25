import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export type SearchBarProps = {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmitQuery?: (q: string) => void;
};

export default function SearchBar({
  className,
  placeholder = "Search for products, brands and more",
  defaultValue,
  onSubmitQuery,
}: SearchBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const qFromUrl = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") ?? "";
  }, [location.search]);

  const initial = defaultValue ?? qFromUrl;
  const [q, setQ] = React.useState(initial);

  React.useEffect(() => {
    const next = defaultValue ?? qFromUrl;
    setQ(next);
  }, [defaultValue, qFromUrl]);

  const submit = React.useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (onSubmitQuery) {
        onSubmitQuery(trimmed);
        return;
      }
      const params = new URLSearchParams(location.search);
      if (trimmed) {
        params.set("q", trimmed);
        params.delete("scope");
      } else {
        params.delete("q");
        params.delete("scope");
      }
      navigate({ pathname: "/search", search: `?${params.toString()}` });
    },
    [navigate, location.search, onSubmitQuery]
  );

  const clear = React.useCallback(() => {
    setQ("");
    const params = new URLSearchParams(location.search);
    params.delete("q");
    params.delete("scope");
    navigate({ pathname: "/search", search: `?${params.toString()}` });
  }, [location.search, navigate]);

  return (
    <form
      role="search"
      aria-label="Site search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(q);
      }}
      className={[
        "group relative flex w-full items-center",
        "rounded-full border border-zinc-400 bg-zinc-200",
        "hover:bg-zinc-300 hover:border-zinc-500",
        "focus-within:bg-white focus-within:border-zinc-500",
        "focus-within:ring-2 focus-within:ring-zinc-400/80",
        "transition-colors",
        "h-10 sm:h-11 px-2 sm:px-3",
        className || "",
      ].join(" ")}
    >
      <span
        className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      >
        <Search className="h-4 w-4" />
      </span>

      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={[
          "flex-1 !bg-transparent !border-0 !outline-none !ring-0 !shadow-none",
          "!focus:ring-0 !focus:border-0 !focus-visible:ring-0 !focus-visible:border-0",
          "placeholder:text-zinc-400 group-hover:placeholder:text-zinc-500",
          "text-sm sm:text-[15px] pl-8 sm:pl-9 pr-9",
          "[appearance:textfield] [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden",
        ].join(" ")}
      />

      {q && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
