/**
 * @description Strip '0x' prefix from input string. If there is no '0x' prefix, return the original
 * input.
 *
 * @returns input without '0x' prefix or original input if no prefix.
 */
export function stripHexPrefix(input: string): string {
  if (input.indexOf("0x") === 0) {
    return input.slice(2);
  }

  return input;
}
