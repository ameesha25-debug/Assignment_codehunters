import { Link } from "react-router-dom";

export type Item = { name: string; slug: string };

type Level1Props = {
  kind: "level1";
  items: Item[];
  activeSlug?: string;
  basePath?: string; // e.g. "/category/women"
};

type Level2Props = {
  kind: "level2";
  parentSlug: string;
  items: Item[];
  activeSlug?: string;
};

type Props = Level1Props | Level2Props;

export default function TextCategoryBar(props: Props) {
  const { items, activeSlug } = props;

  return (
    <nav aria-label="Categories" className="mb-3">
      {/* Full-bleed wrapper, with an inner rail line */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="border-b border-gray-200" />
        <div className="py-2">
          <ul className="relative z-10 mx-auto flex max-w-[1200px] justify-center gap-8">
            {items.map((it) => {
              const href =
                props.kind === "level2"
                  ? `/category/${("parentSlug" in props ? props.parentSlug : "")}/${it.slug}`
                  : `${("basePath" in props && props.basePath ? props.basePath : "/category")}/${it.slug}`;

              const active = activeSlug === it.slug;

              return (
                <li key={it.slug} className="shrink-0 group">
                  <Link
                    to={href}
                    className={[
                      "relative inline-block py-3.5 text-sm font-medium transition-colors",
                      active
                        ? "text-yellow-500" // active text is yellow
                        : "text-muted-foreground hover:text-yellow-500", // hover turns text yellow
                    ].join(" ")}
                  >
                    <span>{it.name}</span>

                    {/* Underline: persistent yellow for active; animated in on hover for inactive */}
                    <span
                      className={[
                        "pointer-events-none absolute left-0 -bottom-[2px] h-[3px] rounded-full transition-all duration-200",
                        "bg-yellow-400",
                        active ? "w-full" : "w-0 group-hover:w-full",
                      ].join(" ")}
                      style={{ transform: "translateY(-2px)" }} // sit over the rail
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
