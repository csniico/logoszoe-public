import { BookOpen, GraduationCap, Mic2, Newspaper, Heart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Ordered as a progressive walk of faith - devotionals → courses → podcasts →
// articles → prayer → community.
const steps: Step[] = [
  {
    icon: BookOpen,
    title: "Daily Devotionals",
    description: "Start each day with purpose. Short, powerful devotionals to anchor your morning in the Word.",
  },
  {
    icon: GraduationCap,
    title: "In-depth Courses",
    description: "Go deeper. Structured courses taught by trusted voices help you build a firm scriptural foundation.",
  },
  {
    icon: Mic2,
    title: "Podcasts",
    description: "Keep growing on the go. Faith-building conversations and teaching for your commute and quiet moments.",
  },
  {
    icon: Newspaper,
    title: "Articles",
    description: "Explore the breadth of the faith - from theology to everyday Christian living, at your own pace.",
  },
  {
    icon: Heart,
    title: "Prayer Wall",
    description: "Turn what you learn into intercession. Submit requests and stand in prayer for one another.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Arrive where the journey leads - a family of believers to share testimonies and grow together.",
  },
];

/**
 * "Everything For Your Faith Journey" as a list of icon cards.
 *
 * Presentational + static server component. The `steps` array is the single
 * source of truth (OCP); each entry renders a card with a plain (uncolored)
 * icon, then title and description.
 */
export function JourneyRoadmap() {
  return (
    <section
      id="features"
      className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 bg-ivory border-y border-primary-100/60"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-900">
            Everything For Your Faith Journey
          </h2>
          <p className="text-primary-900/60 text-base sm:text-lg mt-4 leading-relaxed">
            A guided path - from your very first morning devotional to a thriving
            community. Follow the road as your walk with Christ deepens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl bg-white ring-1 ring-primary-100/70 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <Icon size={26} strokeWidth={1.75} className="text-primary-900 mb-4" aria-hidden />
              <h3 className="font-serif text-xl font-semibold text-primary-900 mb-2">
                {title}
              </h3>
              <p className="text-primary-900/70 text-sm leading-relaxed">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
