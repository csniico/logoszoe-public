"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { categoryApi, type Category } from "@/lib/api";

/** Presentational card for a single category. */
function CategoryCard({ category }: { category: Category }) {
  const accent = category.color || "#5a82a8";

  return (
    <article className="group flex flex-col items-center text-center">
      {/* Circular imagery - mirrors the source site's rounded portraits */}
      <div
        className="relative w-20 h-20 sm:w-32 sm:h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden ring-1 ring-black/5 shadow-sm"
        style={{ backgroundColor: `${accent}14` }}
      >
        {category.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.bannerUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-semibold" style={{ color: accent }}>
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <h3 className="font-serif text-sm sm:text-lg lg:text-xl font-semibold text-primary-900 mt-3 sm:mt-5 lg:mt-6 mb-2">
        {category.name}
      </h3>
      {category.description && (
        <p className="hidden sm:block text-sm text-primary-900/60 leading-relaxed max-w-xs mb-5 line-clamp-3">
          {category.description}
        </p>
      )}

      <Link
        href={`/articles/${category.slug}`}
        className="mt-auto inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
      >
        Read more
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-44 lg:h-44 rounded-full bg-primary-100/60 animate-pulse" />
      <div className="h-4 w-16 sm:w-32 bg-primary-100/60 rounded mt-3 sm:mt-6 animate-pulse" />
      <div className="hidden sm:block h-3 w-48 bg-primary-100/50 rounded mt-3 animate-pulse" />
    </div>
  );
}

/**
 * "Winning And Preparing Souls For His Second Coming" - the category showcase.
 *
 * Container component: owns the fetch lifecycle against the public categories
 * endpoint (DIP - depends on the `categoryApi` abstraction, not fetch directly)
 * and renders Loading / Error / Empty / Success states explicitly.
 */
export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    categoryApi
      .getAll()
      .then(({ categories }) => {
        if (active) setCategories(categories);
      })
      .catch(() => {
        if (active) setError("We couldn't load our content areas right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="explore" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-3 mb-5" aria-hidden>
            <span className="h-px w-10 bg-gold-300" />
            <Compass size={18} className="text-gold-500" />
            <span className="h-px w-10 bg-gold-300" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-900 leading-tight">
            Winning &amp; Preparing Souls For His Second Coming
          </h2>
          <p className="text-primary-900/60 text-base sm:text-lg mt-5 leading-relaxed">
            The Noah&apos;s Project is an online Christian missionary project providing a
            complete ecosystem for the unbelieving to search and know the truth, and for
            the believer to be rooted and built up in Jesus Christ.
          </p>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-primary-900/50 text-sm py-10">{error}</p>
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="text-center text-primary-900/50 text-sm py-10">
            New content areas are coming soon.
          </p>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-14">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
