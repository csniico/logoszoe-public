import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Left sidebar (desktop only) */}
      <Sidebar />

      {/* Top bar (desktop only - sits right of sidebar) */}
      <TopBar />

      {/* Mobile header + drawer */}
      <MobileHeader />

      {/* Main content
          - Mobile: push down by mobile header height (pt-14)
          - Desktop: push right by sidebar (pl-64) + down by topbar (pt-14) */}
      <main className="lg:pl-64 pt-14 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
