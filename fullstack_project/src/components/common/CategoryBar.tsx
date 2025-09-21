import { useEffect, useState } from "react";
import { api, type Category } from "../../lib/api";
import { Link } from "react-router-dom";

export default function CategoryBar() {
  const [roots, setRoots] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .roots()
      .then(setRoots)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
     

      {error && (
        <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
      )}

      {/* centered row */}
      <div className="w-full flex justify-center">
        <div className="flex flex-wrap items-start justify-center gap-6 md:gap-8 max-w-5xl">
          {roots.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group inline-flex flex-col items-center"
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-md border bg-gray-50">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-gray-400 text-xs px-2 text-center">
                    {cat.name}
                  </div>
                )}
              </div>
              <div className="mt-2 text-center text-sm font-medium">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
