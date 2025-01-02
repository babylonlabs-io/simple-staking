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
export const trim = (
  str: string | undefined,
  symbols: number = 8,
): string | undefined => {
  if (str === undefined) return undefined;
  if (symbols < 0) throw new Error("Symbols count cannot be negative");
  if (str.length <= symbols) return str;

  const halfLength = Math.floor(symbols / 2);
  const firstHalf = str.slice(0, halfLength);
  const secondHalf = str.slice(-halfLength);

  return `${firstHalf}...${secondHalf}`;
};
