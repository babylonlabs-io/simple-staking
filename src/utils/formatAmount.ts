export function formatAmount(amount: number): string {
  let abbreviated: string;

  const trillion = 1_000_000_000_000;
  const billion = 1_000_000_000;
  const million = 1_000_000;
  const thousand = 1_000;

  if (amount >= trillion) {
    // Trillions
    abbreviated = (amount / trillion).toFixed(2) + "T";
  } else if (amount >= billion) {
    // Billions
    abbreviated = (amount / billion).toFixed(2) + "B";
  } else if (amount >= million) {
    // Millions
    abbreviated = (amount / million).toFixed(2) + "M";
  } else if (amount >= thousand) {
    // Thousands
    abbreviated = (amount / thousand).toFixed(2) + "k";
  } else {
    abbreviated = amount.toFixed(2);
  }

  const [numberPart, suffix] = abbreviated.split(/([a-zA-Z]+)/);
  const formattedNumber = parseFloat(numberPart).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return suffix ? formattedNumber + suffix : formattedNumber;
}
