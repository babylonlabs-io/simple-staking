import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { colors } from "../theme/colors";
import { typographyVariants } from "../theme/typographyVariants";

const fontSize = [...Object.keys(typographyVariants)];
const textColor = [
  ...Object.keys(colors.tokensLight),
  ...Object.keys(colors.tonalPalette),
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: fontSize }],
      "text-color": [{ text: textColor }],
    },
  },
});

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
