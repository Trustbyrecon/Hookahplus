import React from 'react';

export default function SecurePaymentNotice() {
  return (
    <div className="flex items-center gap-2 text-deepMoss text-sm mt-2">
      <span role="img" aria-label="secure">🔒</span>
      <span>Payments are processed securely by Stripe.</span>
    </div>
  );
}
