"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Search, ChevronDown } from "lucide-react";
import {
  shopApi,
  Product,
  ProductCategory,
  ProductStatus,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
} from "@/lib/api";

// ── Status badge colours ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProductStatus, string> = {
  available:    "bg-gray-200 text-gray-800",
  coming_soon:  "bg-blue-100 text-blue-700",
  out_of_stock: "bg-gray-100 text-gray-500",
  "pre-order":  "bg-amber-100 text-amber-700",
};

function statusLabel(status: ProductStatus) {
  return PRODUCT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function categoryLabel(cat: ProductCategory) {
  return PRODUCT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="h-48 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const unavailable =
    product.status === "coming_soon" || product.status === "out_of_stock";

  return (
    <Link
      href={`/shop/${product._id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ShoppingBag size={40} className="text-gray-300" />
        )}
        {/* pre-order overlay only - status shown in card body, avoid duplication */}
        {product.status === "pre-order" && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Pre-order
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {categoryLabel(product.category)}
        </span>
        <h3 className="font-semibold text-gray-900 mt-0.5 mb-2 text-sm leading-snug group-hover:text-gray-900 transition-colors line-clamp-2 flex-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-end mt-auto pt-2">
          {unavailable ? (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${STATUS_STYLES[product.status]}`}>
              {statusLabel(product.status)}
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white group-hover:bg-gray-800 transition-colors">
              View
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SortKey = "newest" | "az" | "za";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "az",     label: "A → Z" },
  { value: "za",     label: "Z → A" },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    shopApi
      .getAll()
      .then(setProducts)
      .catch((e) => setError(e.message ?? "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (status) list = list.filter((p) => p.status === status);

    switch (sort) {
      case "az":         list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "za":         list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "newest":
      default:
        list.sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
    }

    return list;
  }, [products, search, category, status, sort]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 text-sm mt-1">
          Books, journals and resources to support your faith.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 mb-6">
        {/* Search - full width */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 bg-white"
          />
        </div>

        {/* Dropdowns - horizontal scrollable row, no wrapping */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
          {/* Category */}
          <div className="relative flex-shrink-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | "")}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-700 cursor-pointer"
            >
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative flex-shrink-0">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | "")}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-700 cursor-pointer"
            >
              <option value="">All statuses</option>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">
            {products.length === 0 ? "No products yet." : "No products match your search."}
          </p>
          {products.length > 0 && (
            <button
              onClick={() => { setSearch(""); setCategory(""); setStatus(""); }}
              className="mt-3 text-sm text-gray-900 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
