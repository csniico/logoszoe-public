"use client";

import { useCarousel } from "@/hooks/useCarousel";

export interface BannerSlide {
  src: string;
  alt: string;
}

interface BannerCarouselProps {
  slides: BannerSlide[];
  /** Auto-advance interval in milliseconds. Defaults to 3000ms. */
  intervalMs?: number;
}

/**
 * Responsive, auto-advancing image carousel.
 *
 * Presentational component: renders purely from `slides` + the `index` supplied
 * by `useCarousel`, keeping timer/side-effect concerns out of the markup (SRP).
 * Loops back to the first slide after the last.
 */
export function BannerCarousel({ slides, intervalMs = 3000 }: BannerCarouselProps) {
  const { index, goTo, hoverHandlers } = useCarousel({
    count: slides.length,
    intervalMs,
  });

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden  bg-gray-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      {...hoverHandlers}
    >
      {/* Sliding track */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className="w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-48 sm:h-72 lg:h-104 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? "w-6 bg-white"
                : "w-2 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
