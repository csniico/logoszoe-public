import { FileText, Clock, Eye } from "lucide-react";
import Link from "next/link";

const categories = ["All", "Faith", "Theology", "Growth", "Community", "Prayer", "Leadership"];

const articles = [
  { id: "1", slug: "finding-peace-in-chaos", title: "Finding Peace in the Midst of Chaos", category: "Faith", readTime: "4 min", views: 1240, excerpt: "In a world that never slows down, finding stillness in God is both our greatest challenge and our deepest need." },
  { id: "2", slug: "daily-bible-study-habits", title: "5 Habits That Will Transform Your Bible Study", category: "Growth", readTime: "6 min", views: 890, excerpt: "Consistency in the Word doesn't require hours each day — it requires intentionality and the right approach." },
  { id: "3", slug: "community-and-faith", title: "Why Community is Essential to Your Faith", category: "Community", readTime: "3 min", views: 650, excerpt: "Faith was never meant to be a solo journey. Discover why the early church gathered — and why you should too." },
  { id: "4", slug: "understanding-grace", title: "Understanding Grace Beyond Sunday School", category: "Theology", readTime: "8 min", views: 2100, excerpt: "Grace is more than a familiar word — it's a revolutionary truth that changes how we see ourselves and others." },
  { id: "5", slug: "prayer-that-moves-mountains", title: "Prayer That Actually Moves Mountains", category: "Prayer", readTime: "5 min", views: 1780, excerpt: "Jesus didn't teach us to pray eloquently. He taught us to pray boldly, with faith and persistence." },
  { id: "6", slug: "servant-leadership", title: "The Forgotten Art of Servant Leadership", category: "Leadership", readTime: "7 min", views: 430, excerpt: "True Christian leadership isn't about position or platform — it's about towel and basin." },
];

export default function ArticlesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <p className="text-gray-500 text-sm mt-1">Explore faith, theology, and everyday Christian living.</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === 0
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Placeholder image */}
            <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            <div className="p-5">
              <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{article.category}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-2 group-hover:text-gray-900 transition-colors leading-snug">{article.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {article.views.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
