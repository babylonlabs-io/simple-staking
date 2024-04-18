import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "600px",
      md: "768px",
      lg: "1000px",
      xl: "1130px",
      "2xl": "1350px",
    },
    extend: {
      colors: {
        primary: "#FF7C2A",
        secondary: "#0DB7BF",
      },
      gridTemplateColumns: {
        finalityProviders: "2fr 1fr 1.75fr",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#FF7C2A",
          secondary: "#0DB7BF",
          "base-100": "#F6F6F6",
          "base-200": "rgba(225, 225, 225, 0.3)",
          "base-300": "#FFF",
          "base-content": "#000",
        },
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#FF7C2A",
          secondary: "#0DB7BF",
          "base-100": "#000",
          "base-200": "#303030",
          "base-300": "#1E1E1E",
          "base-content": "#FFF",
        },
      },
    ],
  },
};
export default config;
