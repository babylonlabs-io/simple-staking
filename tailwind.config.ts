import type { Config } from "tailwindcss";

import { screenBreakPoints } from "./src/ui/common/config/screen-breakpoints";

const coreUIConfig = require("@babylonlabs-io/core-ui/tailwind");

const config: Config = {
  presets: [coreUIConfig],
  content: ["./src/ui/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: screenBreakPoints,
  },
};

export default config;
