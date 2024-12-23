/**
 * Trims a string by keeping a portion from the start and end, adding ellipsis in the
 * middle if the string exceeds the specified length.
 *
 * @param {string | undefined} str - The string to be trimmed.
 * @param {number} [symbols=8] - The total number of symbols to retain in the
 * trimmed string, excluding the ellipsis. Defaults to 8 if not provided.
 * @returns {string | undefined} - The trimmed string with ellipsis in the middle if the
 * original string length exceeds the specified symbol count. Returns undefined if input is undefined.
 *
 * @example
 * trim("abcdefghijk", 4) // returns "ab...jk"
 * trim("abc", 4) // returns "abc"
 * trim(undefined) // returns undefined
 */
export const trim = (str?: string, symbols: number = 8) => {
  if (!str) return "-";
  if (str.length <= symbols) {
    return str;
  } else if (symbols === 0) {
    return "...";
  }
  return `${str.slice(0, symbols / 2)}...${str.slice(-symbols / 2)}`;
};
