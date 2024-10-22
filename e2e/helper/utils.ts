export const extractNumericBalance = (balanceString: string | null): number => {
  if (!balanceString) return 0;

  // Use a regular expression to extract the numeric part
  const match = balanceString.match(/([\d.]+)/);
  return match ? Number(match[0]) : 0;
};
