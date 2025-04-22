export const pxToRem = (value: number) => `${value / 16}rem`;

export const spacingToPx = (value: number) => `${value * 8}px`;

export const spacingToRem = (value: number) => pxToRem(value * 8);

export const pxToFontVmin = (px: number, min?: number, max?: number) => {
  const vminValue = (Math.abs(16 - px) / 1680) * 100;
  return `clamp(${min || px * 0.9}px, calc(1rem + ${vminValue}vmin), ${max || px}px)`;
};

export const percentToHex = (p: number) => {
  const intValue = Math.round((p / 100) * 255);
  const hexValue = intValue.toString(16);
  return hexValue.padStart(2, "0").toUpperCase();
};

export const colorOpacity = (color: string, opacity: number) => {
  return `${color}${percentToHex(opacity)}`;
};

export const decorativeColorSet = [
  "bg-decorationViolet",
  "bg-decorationYellow",
  "bg-decorationPink",
  "bg-decorationMint",
  "bg-decorationSkin",
  "bg-decorationSky",
  "bg-decorationBlue",
  "bg-decorationPink",
  "bg-decorationSkin",
];
