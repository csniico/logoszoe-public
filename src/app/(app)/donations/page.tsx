import { DonationsClient } from "./DonationsClient";

// `force-dynamic` keeps this page out of the static cache so env vars are read
// at request time.
export const dynamic = "force-dynamic";

export default function DonationsPage() {
  // Card payments via RevenueCat/Stripe are disabled for now — Paystack handles
  // every channel (card, mobile money, bank) through the backend. Kept commented
  // so card-via-RevenueCat can be re-enabled quickly if needed.
  // const rcApiKey = process.env.REVENUECAT_WEB_BILLING_KEY ?? null;
  const rcApiKey = null;
  // The browser doesn't need the Paystack key (the access code drives the popup),
  // so we only pass a boolean to gate online giving.
  const paystackEnabled = !!process.env.PAYSTACK_PUBLIC_KEY;
  return <DonationsClient rcApiKey={rcApiKey} paystackEnabled={paystackEnabled} />;
}
