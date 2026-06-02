import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  currencySymbol?: string;
  showCurrencyCode?: boolean;
  className?: string;
}

export function CurrencyDisplay({ amount, currency = "USD", currencySymbol, showCurrencyCode, className }: Readonly<CurrencyDisplayProps>) {
  // Use Intl.NumberFormat to get the parts
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'narrowSymbol', // Use narrow symbol to get the shortest default symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parts = formatter.formatToParts(amount);
  
  // Reconstruct the string, substituting the symbol if a custom one is provided
  let formatted = '';
  for (const part of parts) {
    if (part.type === 'currency') {
      formatted += currencySymbol || part.value;
    } else {
      formatted += part.value;
    }
  }

  // If the user wants to explicitly show the code as well (e.g. "BDT ৳10.00")
  if (showCurrencyCode) {
    formatted = `${currency} ${formatted}`;
  }

  return <span className={cn(className)}>{formatted}</span>;
}
