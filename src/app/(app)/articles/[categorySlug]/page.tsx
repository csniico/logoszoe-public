"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { articleApi, categoryApi, Article, Category } from "@/lib/api";
import { Clock, Eye, FileText } from "lucide-react";

function readTime(content?: string) {
  if (!content) return "2 min";
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function ArticleCard({ article }: { article: Article }) {
  const cat = article.category as Category;
  return (
    <Link
      href={`/articles/read/${article.slug}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div
        className="h-40 flex items-center justify-center"
        style={{ background: cat?.color ? `${cat.color}18` : "#f0fdf4" }}
      >
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText size={32} style={{ color: cat?.color ?? "#16a34a", opacity: 0.4 }} />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        {article.author && (
          <p className="text-xs text-gray-400 mb-3">By {article.author}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {readTime(article.content)}
          </span>
          {(article.hits ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} /> {article.hits!.toLocaleString()}
            </span>
          )}
          {!article.published && (
            <span className="text-amber-500 font-medium">Draft</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CategoryArticlesPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = use(params);

  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      articleApi.getByCategory(categorySlug),
      categoryApi.getAll(),
    ])
      .then(([arts, { categories }]) => {
        setArticles(arts);
        const cat = categories.find((c) => c.slug === categorySlug) ?? null;
        setCategory(cat);
      })
      .catch(() => setError("Failed to load articles. Please try again."))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  return (
    <div>
      {/* Category article: picture + header + body, before the articles */}
      <div className="mb-10">
        {category?.bannerUrl && (
          <div className="rounded-2xl overflow-hidden mb-5 aspect-[16/7] bg-gray-100">
            <img
              src={category.bannerUrl}
              alt={category.article_title || category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900">
          {category?.article_title || category?.name || categorySlug}
        </h1>

        {category?.article_body ? (
          <div
            className="prose prose-gray prose-sm sm:prose-base max-w-none mt-4
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-gray-900 prose-a:underline
              prose-strong:text-gray-900
              prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-500 prose-blockquote:italic
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: category.article_body }}
          />
        ) : (
          category?.description && (
            <p className="text-gray-500 text-sm mt-3 max-w-2xl">{category.description}</p>
          )
        )}
      </div>

      {/* Articles heading */}
      {!loading && !error && articles.length > 0 && (
        <div className="mb-4 flex items-baseline justify-between border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-900">Articles</h2>
          <span className="text-gray-400 text-sm">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No articles in this category yet.</p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
