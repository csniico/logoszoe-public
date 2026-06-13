"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  HandHeart,
  Gift,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { donationApi, Donation, DonationCategory } from "@/lib/api";
import { DONATION_CAUSES, causeTitleForProduct } from "@/lib/donation-catalog";
import { DONATION_FAQ } from "@/lib/donation-faq";
import {
  purchaseDonation,
  fetchProductPrices,
  PurchaseCancelledError,
} from "@/lib/revenuecat";

function formatAmount(amount?: number, currency?: string): string {
  if (amount == null) return "—";
  const cur = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${cur}`;
  }
}

type Toast = { kind: "success" | "error"; message: string } | null;

export function DonationsClient({ rcApiKey }: { rcApiKey: string | null }) {
  const { user } = useAuth();

  const [history, setHistory] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DonationCategory>("partnership");
  const [processing, setProcessing] = useState<string | null>(null); // cause key
  const [toast, setToast] = useState<Toast>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const givingEnabled = !!rcApiKey;

  useEffect(() => {
    donationApi
      .getMine()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Resolve prices from RevenueCat (best-effort).
  useEffect(() => {
    if (!rcApiKey || !user) return;
    const ids = DONATION_CAUSES.flatMap((c) => [c.products.partnership, c.products.oneTime]);
    fetchProductPrices(rcApiKey, user._id, ids).then(setPrices).catch(() => {});
  }, [rcApiKey, user]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleGive(causeKey: string, productIdentifier: string) {
    if (!rcApiKey || !user || processing) return;
    setProcessing(causeKey);
    setToast(null);
    try {
      const outcome = await purchaseDonation({
        apiKey: rcApiKey,
        appUserId: user._id,
        productIdentifier,
        customerEmail: user.email,
      });

      // Log to our backend (best-effort — the payment already went through).
      try {
        const created = await donationApi.log({
          transactionId: outcome.transactionId,
          productIdentifier: outcome.productIdentifier,
          category: tab,
          platform: "web",
          purchaseDate: outcome.purchaseDate,
          amount: outcome.amount,
          currency: outcome.currency,
        });
        setHistory((h) => [created, ...h.filter((d) => d._id !== created._id)]);
      } catch {
        // payment succeeded but logging failed — still thank the donor
      }

      setToast({
        kind: "success",
        message:
          "Your donation was successful. Please check your email for your order confirmation. God bless you!",
      });
    } catch (e) {
      if (e instanceof PurchaseCancelledError) {
        // user backed out — no toast
      } else {
        const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
        setToast({ kind: "error", message: msg });
      }
    } finally {
      setProcessing(null);
    }
  }

  function priceLabel(cat: DonationCategory, price?: string): string {
    if (!price) return givingEnabled ? "Loading…" : "";
    return cat === "partnership" ? `starting at ${price}/month` : `One-time payment ${price}`;
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <HandHeart size={18} className="text-primary-700" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        </div>
        <p className="text-sm text-gray-500">
          Partner with the ministry to reach souls and grow disciples around the world.
        </p>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
            toast.kind === "success"
              ? "bg-primary-50 text-primary-800 border border-primary-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Cards (left) + FAQ (right on desktop, below on mobile) ── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Give section */}
        <section className="w-full lg:flex-1 min-w-0">
          {/* Tab switcher */}
          <div className="inline-flex bg-gray-100 rounded-full p-1 mb-5">
            <button
              onClick={() => setTab("partnership")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === "partnership" ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart size={14} /> Become a Partner
            </button>
            <button
              onClick={() => setTab("oneTime")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === "oneTime" ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Gift size={14} /> Donate
            </button>
          </div>

          {!givingEnabled && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-4 bg-gold-50 text-gold-800 border border-gold-100 text-sm">
              <Sparkles size={16} className="flex-shrink-0 mt-0.5" />
              <span>Online giving is being set up and will be available shortly.</span>
            </div>
          )}

          {/* Gradient cards (mirror the mobile app) */}
          <div className="space-y-3.5">
            {DONATION_CAUSES.map((cause) => {
              const isBusy = processing === cause.key;
              const label = priceLabel(tab, prices[cause.products[tab]]);
              return (
                <button
                  key={cause.key}
                  onClick={() => handleGive(cause.key, cause.products[tab])}
                  disabled={!givingEnabled || !!processing}
                  className="relative w-full h-44 rounded-2xl overflow-hidden text-left shadow-md transition-transform active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg, ${cause.gradient.join(", ")})` }}
                >
                  {/* Text column */}
                  <div className="absolute inset-0 p-5 pr-32 flex flex-col">
                    <h3 className="text-white text-lg font-semibold leading-snug drop-shadow-sm">
                      {cause.title}
                    </h3>
                    <div className="flex-1" />
                    {label && (
                      <p className="text-white text-base font-bold drop-shadow-sm">{label}</p>
                    )}
                  </div>

                  {/* Illustration */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cause.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-36 w-28 object-contain pointer-events-none select-none"
                  />

                  {/* Busy overlay */}
                  {isBusy && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Got Questions? (FAQ) — right column on desktop, collapsed by default */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-gray-900">Got Questions?</h2>
          <p className="text-sm text-gray-500 mb-4">
            Find answers to common questions about partnership and donations
          </p>
          <div className="space-y-2.5">
            {DONATION_FAQ.map((faq) => {
              const open = openFaq === faq.id;
              return (
                <div key={faq.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(open ? null : faq.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      ?
                    </span>
                    <span className="flex-1 min-w-0 text-sm font-bold text-gray-800">
                      {faq.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pl-14">
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {faq.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ── History ── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Your giving history
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200">
            <HandHeart size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No donations yet. Your gifts will appear here.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden divide-y divide-gray-50">
            {history.map((d) => (
              <div key={d._id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  {d.category === "partnership" ? (
                    <Heart size={15} className="text-primary-700" />
                  ) : (
                    <Gift size={15} className="text-primary-700" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {causeTitleForProduct(d.productIdentifier)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {d.category === "partnership" ? "Partnership" : "One-time"} ·{" "}
                    {new Date(d.purchaseDate || d.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 tabular-nums flex-shrink-0">
                  {formatAmount(d.amount, d.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
