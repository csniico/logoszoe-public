import Link from "next/link";
import { PODCAST_CATEGORIES } from "@/lib/api";
import { Mic2 } from "lucide-react";

export default function PodcastsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Podcasts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Faith-building audio content for every season of life.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PODCAST_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/podcasts/${cat.value}`}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group p-6 flex flex-col gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${cat.color}18` }}
            >
              <Mic2 size={24} style={{ color: cat.color }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                {cat.label}
              </h2>
              <p className="text-sm text-gray-400 mt-1">Browse episodes →</p>
            </div>
            <div
              className="h-1 w-10 rounded-full mt-auto"
              style={{ background: cat.color }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
