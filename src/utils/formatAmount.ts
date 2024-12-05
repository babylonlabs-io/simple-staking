export function formatAmount(
  amount: number,
  locale: string = "en-US",
  currency?: string,
): string {
  let abbreviated: string;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...(currency && { style: "currency", currency }),
  });

  const trillion = 1_000_000_000_000;
  const billion = 1_000_000_000;
  const million = 1_000_000;
  const thousand = 1_000;

  if (amount >= trillion) {
    // Trillions
    abbreviated = formatter.format(amount / trillion) + "T";
  } else if (amount >= billion) {
    // Billions
    abbreviated = formatter.format(amount / billion) + "B";
  } else if (amount >= million) {
    // Millions
    abbreviated = formatter.format(amount / million) + "M";
  } else if (amount >= thousand) {
    // Thousands
    abbreviated = formatter.format(amount / thousand) + "k";
  } else {
    abbreviated = formatter.format(amount);
  }

  return abbreviated;
}
