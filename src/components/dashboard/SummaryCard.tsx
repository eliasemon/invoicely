import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  amount: ReactNode;
  subtitle: string;
  type: 'total' | 'paid' | 'unpaid';
  trend?: string;
}

export function SummaryCard({ title, amount, subtitle, type, trend }: Readonly<SummaryCardProps>) {
  if (type === 'total') {
    return (
      <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_4px_12px_rgba(26,43,60,0.05)] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <MaterialIcon icon="account_balance" className="text-[120px]" />
        </div>
        <div>
          <h2 className="font-label-sm text-label-sm text-on-surface-variant mb-1">{title}</h2>
          <div className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">{amount}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-success">
            <MaterialIcon icon="trending_up" filled className="text-sm" />
            <span className="font-label-sm text-label-sm">{trend}</span>
          </div>
        )}
      </div>
    );
  }

  const borderColors = {
    paid: 'border-l-success',
    unpaid: 'border-l-warning',
  };

  return (
    <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-[0_4px_12px_rgba(26,43,60,0.05)] flex flex-col justify-between border-l-4 ${borderColors[type]}`}>
      <div>
        <h2 className="font-label-sm text-label-sm text-on-surface-variant mb-1">{title}</h2>
        <div className="font-headline-md text-headline-md text-primary font-bold">{amount}</div>
      </div>
      <div className="mt-2 text-on-surface-variant font-label-sm text-label-sm">{subtitle}</div>
    </div>
  );
}
