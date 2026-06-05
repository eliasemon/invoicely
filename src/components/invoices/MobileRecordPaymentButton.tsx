'use client';

import { MaterialIcon } from '@/components/shared/MaterialIcon';

export function MobileRecordPaymentButton() {
  const scrollToPayment = () => {
    const el = document.getElementById('record-payment-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-18 right-3 md:hidden z-50">
      <button
        onClick={scrollToPayment}
        className="bg-primary text-on-primary shadow-level3 rounded-full px-4 py-3 flex items-center gap-2 font-label-md active:scale-95 transition-transform"
      >
        <MaterialIcon icon="payments" className="text-[20px]" />
        {/* <span>Record Payment</span> */}
      </button>
    </div>
  );
}
