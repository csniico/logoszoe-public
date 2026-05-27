import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ivory">
      {/* Mobile header — fixed overlay, visible only below lg breakpoint */}
      <MobileHeader />

      {/* App shell — capped at 1440 px and centered on large displays */}
      <div className="max-w-[1440px] mx-auto flex min-h-screen">

        {/* Desktop sidebar — sticky left column, hidden on mobile */}
        <Sidebar />

        {/* Right column: top bar + page content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8
                           pt-[calc(3.5rem+2rem)] lg:pt-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
