// Paystack inline (popup) wrapper for the Mobile Money flow.
//
// The transaction is initialized server-side (secret key); the browser only
// ever receives an `access_code`, which `resumeTransaction` uses to open the
// hosted checkout. No secret - and no public key - is needed here.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PaystackTransaction {
  reference: string;
  status?: string;
}

interface ResumeHandlers {
  onSuccess: (txn: PaystackTransaction) => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

type PaystackPopup = {
  resumeTransaction: (
    accessCode: string,
    handlers: {
      onSuccess: (txn: PaystackTransaction) => void;
      onCancel: () => void;
      onError: (error: unknown) => void;
    },
  ) => void;
};

/**
 * Open the Paystack popup for an already-initialized transaction.
 * Browser-only - dynamically imported so it never touches SSR.
 */
export async function resumePaystack(accessCode: string, handlers: ResumeHandlers): Promise<void> {
  const mod = await import("@paystack/inline-js");
  const Paystack = ((mod as any).default ?? mod) as new () => PaystackPopup;
  const popup = new Paystack();
  popup.resumeTransaction(accessCode, {
    onSuccess: (txn) => handlers.onSuccess(txn),
    onCancel: () => handlers.onCancel?.(),
    onError: (e) => handlers.onError?.(e),
  });
}
