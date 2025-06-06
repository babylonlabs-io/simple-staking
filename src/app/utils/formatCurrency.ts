export interface FormatCurrencyOptions<T extends string = string> {
  prefix?: T;
  precision?: number;
  zeroDisplay?: string;
  format?: Intl.NumberFormatOptions;
}

const defaultFormatOptions: Required<FormatCurrencyOptions> = {
  prefix: "$",
  precision: 2,
  zeroDisplay: "-",
  format: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

export function formatCurrency(
  currencyValue: number,
  options: FormatCurrencyOptions = {},
): string {
  const { prefix, precision, zeroDisplay, format } = {
    ...defaultFormatOptions,
    ...options,
  };

  if (currencyValue === 0) return zeroDisplay;

  const formatted = currencyValue.toLocaleString(
    "en",
    format ?? { maximumFractionDigits: precision },
  );

  return `${prefix}${formatted}`;
}

/**
 * Converts token amount to formatted currency string
 * @param amount The amount of token
 * @param price The price of token in currency
 * @param options Formatting options
 */
export function calculateTokenValueInCurrency(
  amount: number,
  price: number,
  options?: FormatCurrencyOptions,
): string {
  const currencyValue = amount * price;
  return formatCurrency(currencyValue, options);
}
