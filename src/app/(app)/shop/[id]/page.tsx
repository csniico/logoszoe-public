"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, Package } from "lucide-react";
import {
  shopApi,
  Product,
  ProductStatus,
  PRODUCT_STATUSES,
  PRODUCT_CATEGORIES,
} from "@/lib/api";

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProductStatus, string> = {
  available:    "bg-gray-200 text-gray-800",
  coming_soon:  "bg-blue-100 text-blue-700",
  out_of_stock: "bg-gray-100 text-gray-500",
  "pre-order":  "bg-amber-100 text-amber-700",
};

function statusLabel(s: ProductStatus) {
  return PRODUCT_STATUSES.find((x) => x.value === s)?.label ?? s;
}

function categoryLabel(c: string) {
  return PRODUCT_CATEGORIES.find((x) => x.value === c)?.label ?? c;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-100 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4 pt-2">
          <div className="h-5 w-24 bg-gray-100 rounded" />
          <div className="h-8 w-3/4 bg-gray-100 rounded" />
          <div className="h-8 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shopApi
      .getById(id)
      .then(setProduct)
      .catch((e) => setError(e.message ?? "Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft size={16} /> Shop
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">{error ?? "Product not found."}</p>
          <Link href="/shop" className="mt-3 text-sm text-gray-900 hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const isUnavailable =
    product.status === "coming_soon" || product.status === "out_of_stock";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} /> Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ShoppingBag size={64} className="text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category + status */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {categoryLabel(product.category)}
            </span>
            <span className="text-gray-300">·</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[product.status]}`}
            >
              {statusLabel(product.status)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
            {product.title}
          </h1>

          {/* Price */}
          <p className="text-3xl font-extrabold text-gray-900 mb-4">
            ${product.price.toFixed(2)}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          {/* Stock info */}
          {product.status === "available" && product.quantity > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Package size={15} className="text-gray-400" />
              {product.quantity < 10
                ? <span className="text-amber-600 font-medium">Only {product.quantity} left in stock</span>
                : <span>{product.quantity} in stock</span>}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto">
            {isUnavailable ? (
              <div
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm ${STATUS_STYLES[product.status]}`}
              >
                {statusLabel(product.status)}
              </div>
            ) : product.status === "pre-order" ? (
              <button
                disabled
                className="w-full py-3 rounded-xl font-semibold text-sm bg-amber-500 text-white opacity-80 cursor-not-allowed"
              >
                Pre-order - checkout not yet available
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-900 text-white opacity-80 cursor-not-allowed"
              >
                Checkout not yet available
              </button>
            )}
            <p className="text-xs text-gray-400 text-center mt-2">
              Contact the church to purchase this item.
            </p>
          </div>
        </div>
      </div>

      {/* Extra metadata strip */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-400">
        {product.createdAt && (
          <span>
            Added{" "}
            <strong className="text-gray-600">
              {new Date(product.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
          </span>
        )}
        <span>
          Category: <strong className="text-gray-600">{categoryLabel(product.category)}</strong>
        </span>
        <span>
          SKU: <code className="font-mono">{product.slug}</code>
        </span>
      </div>
    </div>
  );
}
