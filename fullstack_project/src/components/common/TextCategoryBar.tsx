import { Link } from "react-router-dom";

type Item = { name: string; slug: string };

type Level1Props = {
  kind: "level1";
  items: Item[];
  activeSlug?: string;
  basePath?: string; // e.g. "/category/women"
};

type Level2Props = {
  kind: "level2";               // kept for compatibility, not used now
  parentSlug: string;
  items: Item[];
  activeSlug?: string;
};

type Props = Level1Props | Level2Props;

export default function TextCategoryBar(props: Props) {
  const { items, activeSlug } = props;

  return (
    <nav aria-label="Categories" className="mb-3">
      {/* Top grey line, full-bleed */}
      <div className="w-screen border-t border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" />

      {/* Bar wrapper with extra height */}
      <div className="w-screen border-b border-gray-200 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-2">
        <ul className="mx-auto flex max-w-[1200px] justify-center gap-8">
          {items.map((it) => {
            // Always prefer basePath when provided
            const href =
              props.kind === "level2"
                ? `/category/${("parentSlug" in props ? props.parentSlug : "")}/${it.slug}`
                : `${("basePath" in props && props.basePath ? props.basePath : "/category")}/${it.slug}`;

            const active = activeSlug === it.slug;

            return (
              <li key={it.slug} className="shrink-0 group">
                <Link
                  to={href}
                  className={`relative inline-block py-3.5 text-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-yellow-500"
                  }`}
                >
                  <span>{it.name}</span>
                  <span
                    className={`pointer-events-none absolute left-0 -bottom-[2px] h-[3px] rounded-full transition-all duration-200 ${
                      active ? "w-full bg-yellow-400" : "w-0 bg-yellow-400 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
