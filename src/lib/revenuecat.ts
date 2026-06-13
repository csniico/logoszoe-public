// RevenueCat Web Billing wrapper.
//
// The SDK is browser-only, so we dynamically import it inside the purchase
// handler (never at module top-level / SSR). The publishable Web Billing key is
// passed in from a server component that reads it from `process.env` at request
// time — it is NOT inlined into the client bundle at build time.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PurchaseOutcome {
  transactionId: string;
  productIdentifier: string;
  purchaseDate: string; // ISO-8601
  amount?: number;      // smallest currency unit (cents)
  currency?: string;
}

/** Thrown when the user backs out of the RevenueCat checkout. */
export class PurchaseCancelledError extends Error {
  constructor() {
    super("Purchase cancelled");
    this.name = "PurchaseCancelledError";
  }
}

const RC_USER_CANCELLED = 1; // ErrorCode.UserCancelledError

let instance: any = null;
let configuredFor: string | null = null;

async function getInstance(apiKey: string, appUserId: string) {
  const mod = await import("@revenuecat/purchases-js");
  const Purchases = mod.Purchases;
  // Reconfigure if the key or user changed (e.g. different signed-in user).
  if (!instance || configuredFor !== `${apiKey}:${appUserId}`) {
    instance = Purchases.configure(apiKey, appUserId);
    configuredFor = `${apiKey}:${appUserId}`;
  }
  return instance;
}

function findPackage(offerings: any, productIdentifier: string): any | null {
  const scan = (off: any): any | null => {
    if (!off) return null;
    for (const pkg of off.availablePackages ?? []) {
      const prod = pkg.webBillingProduct ?? pkg.rcBillingProduct;
      if (prod?.identifier === productIdentifier) return pkg;
    }
    return null;
  };

  const hitCurrent = scan(offerings?.current);
  if (hitCurrent) return hitCurrent;

  for (const off of Object.values(offerings?.all ?? {})) {
    const hit = scan(off);
    if (hit) return hit;
  }
  return null;
}

/**
 * Flatten every package RevenueCat returns across all offerings into a simple
 * list of { offering, productId, price }. Used for diagnostics — a product that
 * doesn't appear here is NOT attached to any published offering (so it can be
 * neither priced nor purchased) and must be added to an offering in RevenueCat.
 */
function collectAvailableProducts(
  offerings: any,
): Array<{ offering: string; productId: string; price: string }> {
  const seen: Array<{ offering: string; productId: string; price: string }> = [];
  const offers = [offerings?.current, ...Object.values(offerings?.all ?? {})].filter(Boolean);
  for (const off of offers) {
    for (const pkg of (off as any).availablePackages ?? []) {
      const prod = pkg.webBillingProduct ?? pkg.rcBillingProduct;
      if (prod?.identifier) {
        seen.push({
          offering: (off as any).identifier,
          productId: prod.identifier,
          price: prod.currentPrice?.formattedPrice ?? "(no price)",
        });
      }
    }
  }
  return seen;
}

/**
 * Best-effort: resolve formatted price strings for a set of product identifiers
 * from the current offerings. Returns a map of productId → formatted price
 * (e.g. "$10.00"). Never throws — returns whatever it can resolve.
 */
export async function fetchProductPrices(
  apiKey: string,
  appUserId: string,
  productIdentifiers: string[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const purchases = await getInstance(apiKey, appUserId);
    const offerings = await purchases.getOfferings();
    const available = collectAvailableProducts(offerings);
    for (const p of available) {
      if (p.price !== "(no price)" && productIdentifiers.includes(p.productId) && !out[p.productId]) {
        out[p.productId] = p.price;
      }
    }

    // Diagnostic: surface any requested products that RevenueCat didn't return
    // with a price, plus the full list it did return, so offering/price gaps
    // are obvious in the browser console.
    const missing = productIdentifiers.filter((id) => !out[id]);
    if (missing.length) {
      console.warn(
        "[donations] No price for: %o\n" +
          "RevenueCat returned these products across offerings: %o\n" +
          "Each missing product must be added as a package WITH a price to a published offering in the RevenueCat dashboard.",
        missing,
        available,
      );
    }
  } catch (e) {
    console.warn("[donations] fetchProductPrices failed:", e);
  }
  return out;
}

/**
 * Run the RevenueCat hosted web checkout for a product, and return a normalized
 * outcome suitable for `POST /donations`. Throws {@link PurchaseCancelledError}
 * if the user cancels.
 */
export async function purchaseDonation(opts: {
  apiKey: string;
  appUserId: string;
  productIdentifier: string;
  customerEmail?: string;
}): Promise<PurchaseOutcome> {
  const purchases = await getInstance(opts.apiKey, opts.appUserId);
  const offerings = await purchases.getOfferings();

  const pkg = findPackage(offerings, opts.productIdentifier);
  if (!pkg) {
    console.warn(
      "[donations] Product %o is not in any offering. Available: %o",
      opts.productIdentifier,
      collectAvailableProducts(offerings),
    );
    throw new Error(
      "This option isn't available yet — it needs to be added to an offering in RevenueCat.",
    );
  }

  let result: any;
  try {
    result = await purchases.purchase({
      rcPackage: pkg,
      customerEmail: opts.customerEmail,
    });
  } catch (e: any) {
    if (e?.errorCode === RC_USER_CANCELLED) throw new PurchaseCancelledError();
    throw e;
  }

  const price =
    pkg.webBillingProduct?.currentPrice ?? pkg.rcBillingProduct?.currentPrice;
  const txn = result?.storeTransaction;

  return {
    transactionId:
      txn?.storeTransactionId ??
      result?.operationSessionId ??
      `web_${opts.productIdentifier}_${Date.now()}`,
    productIdentifier: txn?.productIdentifier ?? opts.productIdentifier,
    purchaseDate: txn?.purchaseDate
      ? new Date(txn.purchaseDate).toISOString()
      : new Date().toISOString(),
    amount:
      price?.amountMicros != null
        ? Math.round(price.amountMicros / 10000) // micros → cents
        : undefined,
    currency: price?.currency,
  };
}
