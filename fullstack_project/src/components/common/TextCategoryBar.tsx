import { Link } from 'react-router-dom';

type Item = { name: string; slug: string };

type Level1Props = {
  kind: 'level1';
  items: Item[];
  activeSlug?: string;
};

type Level2Props = {
  kind: 'level2';
  parentSlug: string;
  items: Item[];
  activeSlug?: string;
};

type Props = Level1Props | Level2Props;

export default function TextCategoryBar(props: Props) {
  const items = props.items;
  const activeSlug = props.activeSlug;

  return (
    <nav aria-label="Categories" className="mb-4 overflow-auto">
      <ul className="flex gap-3">
        {items.map((it) => {
          const href =
            props.kind === 'level2'
              ? `/category/${props.parentSlug}/${it.slug}`
              : `/category/${it.slug}`;
          const active = activeSlug === it.slug;
          return (
            <li key={it.slug}>
              <Link
                to={href}
                className={`inline-block rounded-full border px-4 py-2 text-sm ${
                  active ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
                }`}
              >
                {it.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
