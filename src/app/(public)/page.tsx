import Link from "next/link";
import { BookOpen, Mic2, GraduationCap, Heart, Users, ChevronRight } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Daily Devotionals",
    description: "Start each day with purpose. Short, powerful devotionals to anchor your morning.",
  },
  {
    icon: GraduationCap,
    title: "In-depth Courses",
    description: "Grow deeper in scripture with structured courses taught by trusted voices.",
  },
  {
    icon: Mic2,
    title: "Podcasts",
    description: "Listen while you commute. Faith-building conversations on the go.",
  },
  {
    icon: BookOpen,
    title: "Articles",
    description: "Explore topics from theology to everyday Christian living.",
  },
  {
    icon: Heart,
    title: "Prayer Wall",
    description: "Submit and pray for one another. A community of intercession.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with believers, share testimonies, and grow together.",
  },
];

const stats = [
  { value: "10K+", label: "Active users" },
  { value: "500+", label: "Articles published" },
  { value: "120+", label: "Podcast episodes" },
  { value: "40+", label: "Courses available" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Logos Zoe" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            <span className="font-semibold text-gray-900">Logos Zoe</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#community" className="hover:text-gray-900 transition-colors">Community</Link>
            <Link href="/auth/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Get started
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold mb-6 border border-gray-200">
            ✦ Faith. Growth. Community.
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Grow deeper in your{" "}
            <span className="text-gray-900">faith</span>{" "}
            every single day
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Devotionals, courses, articles, podcasts and a vibrant community —
            everything you need to live a life rooted in the Word.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Start for free
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-700 text-base font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero visual */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-gray-100 to-emerald-100 rounded-2xl p-8 sm:p-12 flex items-center justify-center min-h-64 border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-2xl">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
                  <div className="text-sm text-gray-900/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything for your faith journey
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              One platform. All the tools you need to grow, connect, and stay rooted.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-gray-900" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="community" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
            Ready to begin?
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of believers building daily habits of faith.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            Create your free account
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

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
            <Link href="#" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
