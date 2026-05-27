"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Calendar, BookOpen, FileText } from "lucide-react";
import { articleApi, Article, Category } from "@/lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readTime(content?: string) {
  if (!content) return "1 min";
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCategory(article: Article): Category | null {
  if (article.category && typeof article.category === "object") {
    return article.category as Category;
  }
  return null;
}

// ── Related article card ───────────────────────────────────────────────────────

function RelatedCard({ article }: { article: Article }) {
  const cat = getCategory(article);
  return (
    <Link
      href={`/articles/read/${article.slug}`}
      className="group flex gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-sm transition-shadow"
    >
      <div
        className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background: cat?.color ? `${cat.color}18` : "#f0fdf4" }}
      >
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <FileText size={20} style={{ color: cat?.color ?? "#16a34a", opacity: 0.4 }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
          {article.title}
        </p>
        {article.author && (
          <p className="text-xs text-gray-400 mt-1">By {article.author}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{readTime(article.content)}</p>
      </div>
    </Link>
  );
}

// ── Bible passage block ────────────────────────────────────────────────────────

function BiblePassages({ passages }: { passages: { ref: string; passage: string[] }[] }) {
  if (!passages.length) return null;
  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        <BookOpen size={14} /> Scripture references
      </h2>
      <div className="space-y-5">
        {passages.map((p, i) => (
          <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{p.ref}</p>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {p.passage.map((verse, vi) => (
                <span key={vi}>
                  <sup className="text-[10px] font-semibold text-gray-400 mr-0.5 not-italic">{vi + 1}</sup>
                  {verse}{" "}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    articleApi
      .getBySlug(slug)
      .then(({ article, relatedArticles }) => {
        setArticle(article);
        setRelated(relatedArticles);
      })
      .catch(() => setError("Article not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="h-56 bg-gray-100 rounded-2xl animate-pulse mb-8" />
        <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse mb-4" />
        <div className="h-8 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${85 + (i % 3) * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8">
          <ArrowLeft size={14} /> All articles
        </Link>
        <div className="text-center py-20">
          <FileText size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{error ?? "Article not found."}</p>
        </div>
      </div>
    );
  }

  const cat = getCategory(article);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> All articles
      </Link>

      {/* Hero image */}
      {article.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7] w-full">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Category chip */}
      {cat && (
        <Link
          href={`/articles/${cat.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4 transition-opacity hover:opacity-80"
          style={{
            background: cat.color ? `${cat.color}18` : "#f0fdf4",
            color: cat.color ?? "#16a34a",
            border: `1px solid ${cat.color ? `${cat.color}40` : "#bbf7d0"}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cat.color ?? "#16a34a" }}
          />
          {cat.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-4">{article.title}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-8 pb-8 border-b border-gray-100">
        {article.author && (
          <span className="text-gray-600 font-medium">By {article.author}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={12} /> {readTime(article.content)}
        </span>
        {(article.hits ?? 0) > 0 && (
          <span className="flex items-center gap-1">
            <Eye size={12} /> {article.hits!.toLocaleString()} views
          </span>
        )}
        {article.createdAt && (
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {formatDate(article.createdAt)}
          </span>
        )}
      </div>

      {/* Article body */}
      {article.content ? (
        <div
          className="prose prose-gray prose-sm sm:prose-base max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-gray-900 prose-a:underline
            prose-strong:text-gray-900
            prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:text-gray-500 prose-blockquote:italic
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      ) : (
        <p className="text-gray-400 italic">No content available.</p>
      )}

      {/* Bible passages */}
      {article.biblePassages && article.biblePassages.length > 0 && (
        <BiblePassages passages={article.biblePassages} />
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            More in {cat?.name ?? "this category"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((rel) => (
              <RelatedCard key={rel._id} article={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
