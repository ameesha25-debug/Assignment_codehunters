import { useEffect, useState } from 'react';
import { api, type Category } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function CategoryBar() {
  const [roots, setRoots] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.roots().then(setRoots).catch((e) => setError(e.message));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Shop by category</h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {roots.map((cat) => (
          <Link key={cat.id} to={`/category/${cat.slug}`} className="group">
            <div className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-gray-400">{cat.name}</div>
              )}
            </div>
            <div className="mt-2 text-center text-sm font-medium">{cat.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
