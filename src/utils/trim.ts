/**
 * Trims a given string to a specified number of symbols, adding ellipsis in the
 * middle if necessary.
 *
 * @param {string} str - The string to be trimmed.
 * @param {number} [symbols=8] - The total number of symbols to retain in the
 * trimmed string, including the ellipsis. Defaults to 8 if not provided.
 * @returns {string} - The trimmed string with ellipsis in the middle if the
 * original string length exceeds the specified symbol count.
 */
export const trim = (str: string, symbols: number = 8) => {
  if (str.length <= symbols) {
    return str;
  } else if (symbols === 0) {
    return "...";
  }
  return `${str.slice(0, symbols / 2)}...${str.slice(-symbols / 2)}`;
};
