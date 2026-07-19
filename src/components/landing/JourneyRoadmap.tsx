interface Step {
  title: string;
  description: string;
  image: string;
}

// Ordered as a progressive walk of faith - devotionals → courses → podcasts →
// articles → prayer → community. Imagery is reused from the banner set (+ one
// mission image) rather than introducing new assets.
const steps: Step[] = [
  {
    title: "Daily Devotionals",
    description: "Start each day with purpose. Short, powerful devotionals to anchor your morning in the Word.",
    image: "/images/banner_image_1.jpg",
  },
  {
    title: "In-depth Courses",
    description: "Go deeper. Structured courses taught by trusted voices help you build a firm scriptural foundation.",
    image: "/images/banner_image_2.jpg",
  },
  {
    title: "Podcasts",
    description: "Keep growing on the go. Faith-building conversations and teaching for your commute and quiet moments.",
    image: "/images/banner_image_3.jpg",
  },
  {
    title: "Articles",
    description: "Explore the breadth of the faith - from theology to everyday Christian living, at your own pace.",
    image: "/images/banner_image_4.jpg",
  },
  {
    title: "Prayer Wall",
    description: "Turn what you learn into intercession. Submit requests and stand in prayer for one another.",
    image: "/images/banner_image_5.jpg",
  },
  {
    title: "Community",
    description: "Arrive where the journey leads - a family of believers to share testimonies and grow together.",
    image: "/images/about/mission.jpg",
  },
];

/**
 * "Everything For Your Faith Journey" as a list of cards.
 *
 * Presentational + static server component. The `steps` array is the single
 * source of truth (OCP); each entry renders a card with image, then title and
 * description.
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
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col rounded-2xl overflow-hidden bg-white ring-1 ring-primary-100/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/10] overflow-hidden bg-primary-100/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold text-primary-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-primary-900/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
