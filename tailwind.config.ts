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
  },
};

export default config;
