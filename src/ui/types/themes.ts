export const ThemeVariants = ["dark", "light"] as const;

export type ThemeVariant = (typeof ThemeVariants)[number];
