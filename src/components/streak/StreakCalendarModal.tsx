"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { streakApi, CalendarDay, StreakSummary } from "@/lib/api";
import { Flame, X } from "lucide-react";

const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_LABELS = ["S","M","T","W","T","F","S"];

export function StreakCalendarModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<StreakSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    streakApi.getMyStreak(30)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const calendar = data?.calendar ?? [];
  const currentStreak = data?.currentStreak ?? 0;
  const longestStreak = data?.longestStreak ?? 0;
  const readCount = data?.readCount ?? 0;

  const firstDay = calendar[0];
  const startDow = firstDay
    ? new Date(firstDay.year, firstDay.month - 1, firstDay.day).getDay()
    : 0;
  const padded: (CalendarDay | null)[] = [
    ...Array(startDow).fill(null),
    ...calendar,
  ];

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">Reading history</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-7">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-100 rounded-lg" />
              <div className="grid grid-cols-7 gap-1">
                {Array(35).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square rounded-full bg-gray-100" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm mb-5 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <Flame size={14} className="text-gold-500" />
                  <strong className="text-gold-600">{currentStreak}</strong>
                  <span className="text-gray-400 font-normal">day streak</span>
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-gray-400">
                  Best <strong className="text-gray-500 font-semibold">{longestStreak}</strong>
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-gray-400">
                  <strong className="text-gray-500 font-semibold">{readCount}</strong> / 30 read
                </span>
              </div>

              {/* Day-of-week labels */}
              <div className="grid grid-cols-7 mb-1">
                {DOW_LABELS.map((d, i) => (
                  <div key={i} className="text-center text-[10px] text-gray-400 font-medium pb-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {padded.map((cell, i) => {
                  if (!cell) return <div key={`pad-${i}`} className="aspect-square" />;

                  const key = `${cell.year}-${cell.month}-${cell.day}`;
                  const isToday = key === todayKey;
                  const hasDevo = !!cell.devotionalId;

                  const inner = (
                    <div className="aspect-square flex flex-col items-center justify-center relative">
                      {cell.read && (
                        <div className="absolute inset-[2px] rounded-full bg-primary-600" />
                      )}
                      {isToday && (
                        <div className={`absolute bottom-[4px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${cell.read ? "bg-white/60" : "bg-gold-400"}`} />
                      )}
                      <span className={`relative z-10 text-[12px] leading-none font-medium ${
                        cell.read   ? "text-white"
                        : !hasDevo  ? "text-gray-300"
                                    : "text-gray-800"
                      }`}>
                        {cell.day}
                      </span>
                      {cell.day === 1 && (
                        <span className={`relative z-10 text-[8px] leading-none mt-0.5 ${cell.read ? "text-white/60" : "text-gray-300"}`}>
                          {MONTH_NAMES_SHORT[cell.month - 1]}
                        </span>
                      )}
                    </div>
                  );

                  if (hasDevo && !cell.read) {
                    return (
                      <Link key={key} href={`/devotionals/${cell.devotionalId}`} onClick={onClose} title={cell.devotionalTitle}>
                        {inner}
                      </Link>
                    );
                  }
                  return <div key={key}>{inner}</div>;
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="w-3 h-3 rounded-full bg-primary-600 flex-shrink-0" /> Read
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0" /> No devotional
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0" /> Today
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
