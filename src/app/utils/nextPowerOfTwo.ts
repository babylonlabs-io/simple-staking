export const nextPowerOfTwo = (x: number) => {
  if (x <= 0) return 2;
  if (x === 1) return 4;

  return Math.pow(2, Math.ceil(Math.log2(x)) + 1);
};
