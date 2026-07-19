import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BannerCarousel, type BannerSlide } from "@/components/ui/BannerCarousel";
import { CategoryShowcase } from "@/components/landing/CategoryShowcase";
import { MissionSection } from "@/components/landing/MissionSection";
import { ValuesSection } from "@/components/landing/ValuesSection";
import { JourneyRoadmap } from "@/components/landing/JourneyRoadmap";

const bannerSlides: BannerSlide[] = [
  { src: "/images/banner_image_1.jpg", alt: "Logos Zoe featured banner 1" },
  { src: "/images/banner_image_2.jpg", alt: "Logos Zoe featured banner 2" },
  { src: "/images/banner_image_3.jpg", alt: "Logos Zoe featured banner 3" },
  { src: "/images/banner_image_4.jpg", alt: "Logos Zoe featured banner 4" },
  { src: "/images/banner_image_5.jpg", alt: "Logos Zoe featured banner 5" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="The Noah's Project - back to top" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/top-banner.png"
              alt="The Noah's Project"
              className="h-9 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#explore" className="hover:text-gray-900 transition-colors">Explore</Link>
            <Link href="#about" className="hover:text-gray-900 transition-colors">About</Link>
            <Link href="#values" className="hover:text-gray-900 transition-colors">Beliefs</Link>
            <Link href="#features" className="hover:text-gray-900 transition-colors">Journey</Link>
          </nav>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Come and see
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* Brand logo - first layer below the appbar */}
      <section className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/top-banner.png"
            alt="The Noah's Project"
            className="w-full max-w-md h-auto"
          />
        </div>
      </section>

      {/* Banner carousel */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mt-6">
          <BannerCarousel slides={bannerSlides} intervalMs={3000} />
        </div>
      </section>

      {/* Category showcase - sourced from the public categories endpoint */}
      <CategoryShowcase />

      {/* Mission narrative - the "days of Noah" */}
      <MissionSection />

      {/* Vision, Mission & Organizational Philosophy */}
      <ValuesSection />

      {/* Feature journey - laid out as a step-by-step roadmap */}
      <JourneyRoadmap />

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Logos Zoe" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            <span className="font-semibold text-gray-900 text-sm">Logos Zoe</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Logos Zoe. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
