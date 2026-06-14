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
  CreditCard,
  Smartphone,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { donationApi, Donation, DonationCategory } from "@/lib/api";
import { DONATION_CAUSES, causeTitleForProduct, DonationCause } from "@/lib/donation-catalog";
import { DONATION_FAQ } from "@/lib/donation-faq";
import { purchaseDonation, PurchaseCancelledError } from "@/lib/revenuecat";
import { resumePaystack } from "@/lib/paystack";

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

export function DonationsClient({
  rcApiKey,
  paystackEnabled,
}: {
  rcApiKey: string | null;
  paystackEnabled: boolean;
}) {
  const { user } = useAuth();

  const [history, setHistory] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DonationCategory>("partnership");
  const [processing, setProcessing] = useState<string | null>(null); // cause key
  const [toast, setToast] = useState<Toast>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [sheetCause, setSheetCause] = useState<DonationCause | null>(null);

  const cardEnabled = !!rcApiKey;
  const momoEnabled = paystackEnabled;
  const givingEnabled = cardEnabled || momoEnabled;

  useEffect(() => {
    donationApi
      .getMine()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Paystack redirect fallback: if we landed back with a ?reference/?trxref,
  // verify it and record the donation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (!ref) return;
    donationApi
      .paystackVerify(ref)
      .then((created) => {
        setHistory((h) => [created, ...h.filter((d) => d._id !== created._id)]);
        setToast({ kind: "success", message: "Thank you! Your Mobile Money donation was received." });
      })
      .catch(() => {})
      .finally(() => window.history.replaceState({}, "", "/donations"));
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Card (RevenueCat) ──────────────────────────────────────────────────────
  async function handleCard(cause: DonationCause) {
    if (!rcApiKey || !user || processing) return;
    setSheetCause(null);
    setProcessing(cause.key);
    setToast(null);
    try {
      const outcome = await purchaseDonation({
        apiKey: rcApiKey,
        appUserId: user._id,
        productIdentifier: cause.products[tab],
        customerEmail: user.email,
      });
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
      if (!(e instanceof PurchaseCancelledError)) {
        const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
        setToast({ kind: "error", message: msg });
      }
    } finally {
      setProcessing(null);
    }
  }

  // ── Mobile Money (Paystack) ────────────────────────────────────────────────
  async function handleMomo(cause: DonationCause, amountMajor: number) {
    if (!user || processing) return;
    setSheetCause(null);
    setProcessing(cause.key);
    setToast(null);
    try {
      const { accessCode } = await donationApi.paystackInitialize(cause.products[tab], tab, amountMajor);
      await resumePaystack(accessCode, {
        onSuccess: (txn) => {
          donationApi
            .paystackVerify(txn.reference)
            .then((created) => setHistory((h) => [created, ...h.filter((d) => d._id !== created._id)]))
            .catch(() => {})
            .finally(() => {
              setToast({ kind: "success", message: "Thank you! Your Mobile Money donation was received." });
              setProcessing(null);
            });
        },
        onCancel: () => setProcessing(null),
        onError: () => {
          setToast({ kind: "error", message: "Mobile Money payment failed. Please try again." });
          setProcessing(null);
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start Mobile Money payment.";
      setToast({ kind: "error", message: msg });
      setProcessing(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center">
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
              return (
                <button
                  key={cause.key}
                  onClick={() => setSheetCause(cause)}
                  disabled={!givingEnabled || !!processing}
                  className="relative w-full h-44 rounded-2xl overflow-hidden text-left shadow-md transition-transform active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg, ${cause.gradient.join(", ")})` }}
                >
                  {/* Text column */}
                  <div className="absolute inset-0 p-5 pr-32 flex flex-col">
                    <h3 className="text-white text-lg font-semibold leading-snug drop-shadow-sm">
                      {cause.title}
                    </h3>
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
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
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

      {/* ── Payment-method sheet ── */}
      {sheetCause && (
        <DonateSheet
          cause={sheetCause}
          mode={tab}
          cardEnabled={cardEnabled}
          momoEnabled={momoEnabled}
          onClose={() => setSheetCause(null)}
          onCard={() => handleCard(sheetCause)}
          onMomo={(amount) => handleMomo(sheetCause, amount)}
        />
      )}
    </div>
  );
}

// ── Payment-method chooser sheet ──────────────────────────────────────────────

function DonateSheet({
  cause,
  mode,
  cardEnabled,
  momoEnabled,
  onClose,
  onCard,
  onMomo,
}: {
  cause: DonationCause;
  mode: DonationCategory;
  cardEnabled: boolean;
  momoEnabled: boolean;
  onClose: () => void;
  onCard: () => void;
  onMomo: (amountMajor: number) => void;
}) {
  const [stage, setStage] = useState<"choose" | "momo">("choose");
  const [amount, setAmount] = useState("");

  const amountNum = parseFloat(amount);
  const amountValid = !isNaN(amountNum) && amountNum >= 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-base font-bold text-gray-900 leading-snug">{cause.title}</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {mode === "partnership" ? "Become a partner" : "Make a one-time gift"}
        </p>

        {stage === "choose" ? (
          <div className="space-y-2.5">
            {cardEnabled && (
              <button
                onClick={onCard}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={17} className="text-primary-700" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-gray-800">Pay with Card</span>
                  <span className="block text-xs text-gray-400">Debit or credit card</span>
                </span>
              </button>
            )}
            {momoEnabled && (
              <button
                onClick={() => setStage("momo")}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone size={17} className="text-gold-600" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-gray-800">Pay with Mobile Money</span>
                  <span className="block text-xs text-gray-400">MTN, Vodafone, AirtelTigo</span>
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Amount (GH₵)</label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 60"
              className="w-full text-sm text-gray-800 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setStage("choose")}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => amountValid && onMomo(amountNum)}
                disabled={!amountValid}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Smartphone size={15} />
                {amountValid ? `Pay GH₵${amountNum.toFixed(2)}` : "Enter amount"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
