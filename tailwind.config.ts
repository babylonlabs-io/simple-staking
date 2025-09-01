import type { Config } from "tailwindcss";

import { screenBreakPoints } from "./src/ui/common/config/screen-breakpoints";

const coreUIConfig = require("@babylonlabs-io/core-ui/tailwind");

const config: Config = {
  presets: [coreUIConfig],
  content: [
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@babylonlabs-io/core-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: screenBreakPoints,
  },
};

export default config;
