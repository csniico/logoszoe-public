"use client";

import { ChevronLeft, ChevronRight, Eye, Send, Sprout, Cog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCarousel } from "@/hooks/useCarousel";

interface Value {
  label: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  body: string;
}

// The source cycles four statements across two recurring images:
// the "Jesus said…" scene (vision + philosophy) and the "Unadulterated
// gospel" typography (mission + work style).
const VISION_IMAGE = "/images/about/vision.jpg";
const MISSION_IMAGE = "/images/about/mission.jpg";

const values: Value[] = [
  {
    label: "Our Vision",
    icon: Eye,
    image: VISION_IMAGE,
    imageAlt: 'Jesus said, "as many as the Father has given me I shall in no wise lose none."',
    body: "An online Christian ecosystem providing the unbeliever the light of God to find His truth, and the child of God the accurate knowledge to be rooted and built up in Him.",
  },
  {
    label: "Our Mission",
    icon: Send,
    image: MISSION_IMAGE,
    imageAlt: "Unadulterated gospel is made simpler and available to all.",
    body: "Our mission is to package and distribute the knowledge of Christ and the message of the Gospel online, towards winning souls and discipling them. To fulfill the great commission is what we stand for.",
  },
  {
    label: "Our Organizational Philosophy",
    icon: Sprout,
    image: VISION_IMAGE,
    imageAlt: 'Jesus said, "as many as the Father has given me I shall in no wise lose none."',
    body: "Our guiding philosophy is that life is a learning and growth process, and that people and beautiful lives perish due to lack of knowledge. All we can do is enhance both believers' and unbelievers' knowledge base in Christ Jesus, open them to the opportunities that are in Christ, trust the Holy Spirit to help them make the right choices, and assist where needed in the pursuit of those choices.",
  },
  {
    label: "Our Work Style",
    icon: Cog,
    image: MISSION_IMAGE,
    imageAlt: "Unadulterated gospel is made simpler and available to all.",
    body: "Our work style, therefore, is to generate valid and useful knowledge of Jesus Christ, distribute that knowledge to online internet users using online tools, and to trust the Holy Spirit to assist all who come in contact with our outreach materials to make free, informed and godly choices, and also develop internal commitment to those choices they make.",
  },
];

/**
 * Vision, Mission, Organizational Philosophy & Work Style - a manual carousel.
 *
 * Container component: reuses `useCarousel` (DRY) with auto-advance disabled
 * (`intervalMs: 0`) so navigation is driven only by the prev/next arrows and
 * the dot indicators. Config-driven `values` array keeps render logic closed
 * for modification (OCP).
 */
export function ValuesSection() {
  const { index, goTo, next, prev } = useCarousel({
    count: values.length,
    intervalMs: 0,
  });

  return (
    <section id="values" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-900">
            What We Stand For
          </h2>
          <p className="text-primary-900/60 text-base sm:text-lg mt-4 leading-relaxed">
            The convictions that shape everything we build and share.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          role="region"
          aria-roledescription="carousel"
          aria-label="What we stand for"
        >
          {/* Viewport */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out will-change-transform [backface-visibility:hidden]"
              style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
            >
              {values.map(({ label, icon: Icon, image, imageAlt, body }, i) => (
                <div
                  key={label}
                  className="w-full shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${values.length}`}
                  aria-hidden={i !== index}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 items-stretch bg-white ring-1 ring-primary-100/70">
                    <div className="h-56 sm:h-72 md:h-full min-h-64 overflow-hidden bg-primary-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={imageAlt}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                          <Icon size={20} className="text-gold-600" />
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-primary-900">
                          {label}
                        </h3>
                      </div>
                      <p className="text-primary-900/70 text-base leading-relaxed">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows at each end */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md ring-1 ring-primary-100 flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md ring-1 ring-primary-100 flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {values.map(({ label }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${label}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-primary-600" : "w-2 bg-primary-200 hover:bg-primary-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
