import type { Config } from "tailwindcss";

import { screenBreakPoints } from "./src/config/screen-breakpoints";

const coreUIConfig = require("@babylonlabs-io/bbn-core-ui/tailwind");

const config: Config = {
  presets: [coreUIConfig],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: screenBreakPoints,
    extend: {
      colors: {
        /**
         * Explicitly copy the coreUIConfig theme under `extend` so that
         * it doesn't get overridden by daisyui plugin
         */
        ...coreUIConfig.theme.colors,
        "base-400": "hsl(var(--base-400) / <alpha-value>)",
      },
      gridTemplateColumns: {
        stakingFinalityProvidersMobile: "2fr 1fr",
        stakingFinalityProvidersDesktop: "2fr 1.5fr 2fr 0.75fr 0.75fr",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    logs: false,
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
          "--base-400": "0 0% 98%",
          ".btn-primary": {
            color: "#FFF",
          },
        },
      },
    ],
  },
};
export default config;
