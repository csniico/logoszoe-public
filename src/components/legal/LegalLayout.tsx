import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Shared shell + presentational primitives for legal documents (privacy, terms).
 *
 * DRY: both legal pages compose the same building blocks, so structure and
 * styling stay consistent and are defined in exactly one place.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Slim header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="The Noah's Project — home" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/top-banner.png" alt="The Noah's Project" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-900">{title}</h1>
        {updated && <p className="text-sm text-gray-500 mt-2">{updated}</p>}
        <div className="space-y-4 mt-8">{children}</div>
      </main>

      <footer className="border-t border-gray-100 py-8 px-4">
        <p className="max-w-3xl mx-auto text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} The Noah&apos;s Project LBG. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

// ── Content primitives (mirror the mobile screen's layout helpers) ────────────

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-primary-100/70 shadow-sm p-6 sm:p-8 space-y-3">
      {children}
    </section>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{children}</p>;
}

export function SectionTitle({ n, children }: { n: number | string; children: React.ReactNode }) {
  return (
    <h2 className="text-sm text-gray-900 scroll-mt-20">
      <span className="font-bold">{n}. </span>
      <span className="font-medium">{children}</span>
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{children}</p>;
}

export function Medium({ children, italic }: { children: React.ReactNode; italic?: boolean }) {
  return (
    <p className={`text-sm font-medium ${italic ? "italic text-gray-500" : "text-gray-800"}`}>
      {children}
    </p>
  );
}

export function InShort({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm italic text-gray-500 leading-relaxed">
      <span className="font-medium">In Short: </span>
      {children}
    </p>
  );
}

export function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5">{children}</ul>;
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-gray-600 leading-relaxed">
      <span className="text-gray-400 select-none" aria-hidden>
        •
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Divider() {
  return <hr className="border-gray-100" />;
}
