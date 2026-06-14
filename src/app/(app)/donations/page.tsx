import { DonationsClient } from "./DonationsClient";

// Read the RevenueCat Web Billing key on the server at REQUEST time (not build
// time) and hand it to the client component as a prop. `force-dynamic` keeps
// this page out of the static cache so the env var is always read at runtime.
export const dynamic = "force-dynamic";

export default function DonationsPage() {
  const rcApiKey = process.env.REVENUECAT_WEB_BILLING_KEY ?? null;
  // The browser doesn't need the Paystack key (the access code drives the popup),
  // so we only pass a boolean to gate the Mobile Money option.
  const paystackEnabled = !!process.env.PAYSTACK_PUBLIC_KEY;
  return <DonationsClient rcApiKey={rcApiKey} paystackEnabled={paystackEnabled} />;
}
