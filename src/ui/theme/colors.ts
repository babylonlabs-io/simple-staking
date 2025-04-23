export const colors = {
  tonalPalette: {
    transparent: "transparent",
    inherit: "inherit",
    neutral0: "#000000",
    neutral5: "#0D0D0D",
    neutral9: "#1B1D21",
    neutral10: "#1F1F1F",
    neutral15: "#24262A",
    neutral20: "#333333",
    neutral30: "#3D3D3D",
    neutral40: "#666666",
    neutral50: "#808080",
    neutral60: "#999999",
    neutral70: "#B2B2B2",
    neutral80: "#CCCCCC",
    neutral90: "#E6E6E6",
    neutral95: "#F5F5F5",
    neutral99: "#FAFAFA",
    neutral100: "#FFFFFF",
    neutral200: "#F2F2F2",
    primary10: "#4C9900",
    primary20: "#88CC00",
    primary30: "#B4E600",
    primary40: "#BCF000",
    primary50: "#C4FA00",
    primary60: "#CCFF00",
    primary70: "#D6FF33",
    primary80: "#E0FF66",
    primary95: "#FAFFE5",
    red10: "#26030A",
    red20: "#330810",
    red30: "#80001D",
    red40: "#FF003C",
    red50: "#FF2949",
    red60: "#FF4667",
    red70: "#FF6683",
    red80: "#FF99AC",
    red90: "#FFDAE1",
    red95: "#FFF0F3",
    orange10: "#261208",
    orange20: "#331F14",
    orange25: "#503426",
    orange30: "#802B00",
    orange40: "#F25700",
    orange50: "#F26718",
    orange60: "#F27630",
    orange70: "#FA8B4B",
    orange80: "#FFB68C",
    orange90: "#FFD7BF",
    orange95: "#FFEFE5",
    lavenderGray: "#E7E1FF",
    cottonCandy: "#FFDBEE",
    paleBlue: "#C8DCFF",
    mintGreen: "#CAFADB",
    peach: "#FFE5DF",
    lemonMeringue: "#FCEECC",
    powderBlue: "#DCF2F2",
    charcoal: "#311F2E",
    oldBurgundy: "#16313A",
    prussianBlue: "#1E4534",
    raisinBlack: "#302222",
    oldWine: "#292822",
    sealBrown: "#1A2A2F",
    tealBlue: "#1F4547",
  },

  tokensLight: {
    current: "currentColor",
    transparent: "transparent",
    surface: "#ffffff", // backgroundPrimaryDefault
    accent: {
      primary: "#000000", // itemPrimaryDefault
      secondary: "#999999", // itemSecondaryDefault
      disabled: "#E6E6E6", // itemPrimaryMute
      contrast: "#FFFFFF", // itemInverseDefault
    },
    neutral: {
      100: "#F5F5F5", // backgroundPrimaryHighlight
      200: "#EFEFEF", // backgroundPrimaryHighlightAlt
    },
    primary: {
      main: "#000000", // itemPrimaryDefault
      dark: "#333333", // itemPrimaryHighlight
      light: "#999999", // itemSecondaryDefault
      contrast: "#FFFFFF", // itemInverseDefault
    },
    secondary: {
      main: "#999999",
      highlight: "#F5F5F5", // backgroundPrimaryHighlight
      contrast: "#000000", // itemInverseDefault
      strokeLight: "#E6E6E6", // itemPrimaryMute
      strokeDark: "#333333", // itemPrimaryHighlight
    },
    error: {
      main: "#FF003C", // itemErrorDefault
      dark: "#FF6683", // itemErrorHighlight
      light: "#FFDAE1", // itemErrorMute
    },
    warning: {
      main: "#F25700", // itemWarningDefault
      dark: "#FA8B4B", // itemWarningHighlight
      light: "#FFD7BF", // itemWarningMute
    },
    info: {
      main: "#007AFF",
      dark: "#1976D2",
      light: "#42A5F5",
    },
    success: {
      main: "#34C759",
      dark: "#2E7D32",
      light: "#66BB6A",
    },
    itemPrimaryDefault: "#000000",
    itemPrimaryDefaultAlt1: "rgba(0, 0, 0, 0.8)",
    itemPrimaryDefaultAlt2: "rgba(0, 0, 0, 0.1)",
    itemPrimaryHighlight: "#333333",
    itemPrimaryActive: "#333333",
    itemPrimaryMute: "#E6E6E6",

    itemSecondaryDefault: "#999999",
    itemSecondaryHighlight: "#000000",
    itemSecondaryActive: "#000000",
    itemSecondaryMute: "#E6E6E6",

    itemInverseDefault: "#FFFFFF",
    itemInverseHighlight: "#E6E6E6",
    itemInverseActive: "#E6E6E6",
    itemInverseMute: "#E6E6E6",

    itemErrorDefault: "#FF003C",
    itemErrorHighlight: "#FF6683",
    itemErrorActive: "#FF6683",
    itemErrorMute: "#FFDAE1",

    itemWarningDefault: "#F25700",
    itemWarningHighlight: "#FA8B4B",
    itemWarningActive: "#FA8B4B",
    itemWarningMute: "#FFD7BF",

    backgroundPrimaryDefault: "#FFFFFF",
    backgroundPrimaryOnDefault: "#000000",
    backgroundPrimaryHighlight: "#F5F5F5",
    backgroundPrimaryHighlightAlt: "#EFEFEF",
    backgroundPrimaryOnHighlight: "#000000",
    backgroundPrimaryActive: "#F5F5F5",
    backgroundPrimaryOnActive: "#000000",
    backgroundPrimaryMute: "#E6E6E6",
    backgroundPrimaryOnMute: "#B2B2B2",

    backgroundSecondaryDefault: "#F5F5F5",
    backgroundSecondaryOnDefault: "#000000",
    backgroundSecondaryHighlight: "#F5F5F5",
    backgroundSecondaryOnHighlight: "#000000",
    backgroundSecondaryActive: "#F5F5F5",
    backgroundSecondaryOnActive: "#000000",
    backgroundSecondaryMute: "#E6E6E6",
    backgroundSecondaryOnMute: "#B2B2B2",

    backgroundInverseDefault: "#000000",
    backgroundInverseOnDefault: "#FFFFFF",
    backgroundInverseHighlight: "#333333",
    backgroundInverseOnHighlight: "#FFFFFF",
    backgroundInverseActive: "#333333",
    backgroundInverseOnActive: "#FFFFFF",
    backgroundInverseMute: "#E6E6E6",
    backgroundInverseOnMute: "#B2B2B2",

    backgroundErrorDefault: "#FFF0F3",
    backgroundErrorOnDefault: "#FF003C",
    backgroundErrorHighlight: "#FFDAE1",
    backgroundErrorOnHighlight: "#FF003C",
    backgroundErrorActive: "#FFDAE1",
    backgroundErrorOnActive: "#FF003C",
    backgroundErrorMute: "#FFF0F3",
    backgroundErrorOnMute: "#FF6683",

    backgroundWarningDefault: "#FFEFE5",
    backgroundWarningOnDefault: "#F25700",
    backgroundWarningHighlight: "#FFD7BF",
    backgroundWarningOnHighlight: "#F25700",
    backgroundWarningActive: "#FFD7BF",
    backgroundWarningOnActive: "#F25700",
    backgroundWarningMute: "#FFEFE5",
    backgroundWarningOnMute: "#FA8B4B",

    backgroundBrandDefault: "#BCF000",
    backgroundBrandOnDefault: "#000000",
    backgroundBrandHighlight: "#B4E600",
    backgroundBrandOnHighlight: "#000000",
    backgroundBrandActive: "#B4E600",
    backgroundBrandOnActive: "#000000",
    backgroundBrandMute: "#E6E6E6",
    backgroundBrandOnMute: "#B2B2B2",

    brandDefault: "#BCF000",

    decorationViolet: "#E7E1FF",
    decorationPink: "#FFDBEE",
    decorationBlue: "#C8DCFF",
    decorationMint: "#CAFADB",
    decorationSkin: "#FFE5DF",
    decorationYellow: "#FCEECC",
    decorationSky: "#DCF2F2",

    mainPairedDefault: "#000000",
    mainPairedActive: "#333333",
  },
  tokensDark: {
    current: "currentColor",
    transparent: "transparent",
    surface: "#1B1D21", // backgroundPrimaryDefault
    accent: {
      primary: "#FFFFFF", // itemPrimaryDefault
      secondary: "#b2b2b2", // itemSecondaryDefault
      disabled: "#333333", // itemPrimaryMute
      contrast: "#000000", // itemInverseDefault
    },
    neutral: {
      100: "#24262a", // backgroundPrimaryHighlight
      200: "#2c2d2f", // backgroundPrimaryHighlightAlt
    },
    primary: {
      main: "#FFFFFF", // itemPrimaryDefault
      dark: "#e6e6e6", // itemPrimaryHighlight
      light: "#b2b2b2", // itemSecondaryDefault
      contrast: "#000000", // itemInverseDefault
    },
    secondary: {
      main: "#b2b2b2",
      highlight: "#242628", // backgroundPrimaryHighlight
      contrast: "#FFFFFF", // itemInverseDefault
      strokeLight: "#333333", // itemPrimaryMute
      strokeDark: "#e6e6e6", // itemPrimaryHighlight
    },
    error: {
      main: "#ff003c", // itemErrorDefault
      dark: "#ff4667", // itemErrorHighlight
      light: "#26030a", // itemErrorMute
    },
    warning: {
      main: "#f25700", // itemWarningDefault
      dark: "#FFB68C", // itemWarningHighlight
      light: "#261208", // itemWarningMute
    },
    info: {
      main: "#007AFF",
      dark: "#1976D2",
      light: "#42A5F5",
    },
    success: {
      main: "#34C759",
      dark: "#2E7D32",
      light: "#66BB6A",
    },
    decorationSky: "#1A2A2F",
    decorationYellow: "#292822",
    decorationSkin: "#302222",
    decorationMint: "#1E4534",
    decorationBlue: "#1F4547",
    decorationPink: "#311F2E",
    decorationViolet: "#16313A",

    brandDefault: "#B4E600",

    backgroundBrandOnMute: "#666666",
    backgroundBrandMute: "#24262a",
    backgroundBrandOnActive: "#000000",
    backgroundBrandActive: "#c4fa00",
    backgroundBrandOnHighlight: "#000000",
    backgroundBrandHighlight: "#c4fa00",
    backgroundBrandOnDefault: "#000000",
    backgroundBrandDefault: "#bcf000",

    backgroundWarningOnMute: "#802b00",
    backgroundWarningMute: "#261208",
    backgroundWarningOnActive: "#ffb68c",
    backgroundWarningActive: "#802b00",
    backgroundWarningOnHighlight: "#ffb68c",
    backgroundWarningHighlight: "#802b00",
    backgroundWarningOnDefault: "#f25700",
    backgroundWarningDefault: "#331f14",

    backgroundErrorOnMute: "#80001d",
    backgroundErrorMute: "#26030a",
    backgroundErrorOnActive: "#ff99ac",
    backgroundErrorActive: "#80001d",
    backgroundErrorOnHighlight: "#ff99ac",
    backgroundErrorHighlight: "#80001d",
    backgroundErrorOnDefault: "#ff003c",
    backgroundErrorDefault: "#330810",

    backgroundInverseOnMute: "#666666",
    backgroundInverseMute: "#24262a",
    backgroundInverseOnActive: "#000000",
    backgroundInverseActive: "#e6e6e6",
    backgroundInverseOnHighlight: "#000000",
    backgroundInverseHighlight: "#e6e6e6",
    backgroundInverseOnDefault: "#000000",
    backgroundInverseDefault: "#e6e6e6",

    backgroundSecondaryOnMute: "#666666",
    backgroundSecondaryMute: "#24262a",
    backgroundSecondaryOnActive: "#e6e6e6",
    backgroundSecondaryActive: "#3d3d3d",
    backgroundSecondaryOnHighlight: "#e6e6e6",
    backgroundSecondaryHighlight: "#3d3d3d",
    backgroundSecondaryOnDefault: "#e6e6e6",
    backgroundSecondaryDefault: "#333333",

    backgroundPrimaryOnMute: "#666666",
    backgroundPrimaryMute: "#24262a",
    backgroundPrimaryOnActive: "#e6e6e6",
    backgroundPrimaryActive: "#3d3d3d",
    backgroundPrimaryOnHighlight: "#e6e6e6",
    backgroundPrimaryHighlight: "#24262a",
    backgroundPrimaryHighlightAlt: "#2c2d2f",
    backgroundPrimaryOnDefault: "#e6e6e6",
    backgroundPrimaryDefault: "#1b1d21",

    itemWarningMute: "#503426",
    itemWarningActive: "#f27630",
    itemWarningHighlight: "#f27630",
    itemWarningDefault: "#f25700",

    itemErrorMute: "#26030a",
    itemErrorActive: "#ff4667",
    itemErrorHighlight: "#ff4667",
    itemErrorDefault: "#ff003c",

    itemInverseMute: "#333333",
    itemInverseActive: "#1f1f1f",
    itemInverseHighlight: "#1f1f1f",
    itemInverseDefault: "#000000",

    itemSecondaryMute: "#333333",
    itemSecondaryActive: "#cccccc",
    itemSecondaryHighlight: "#cccccc",
    itemSecondaryDefault: "#b2b2b2",

    itemPrimaryMute: "#333333",
    itemPrimaryActive: "#e6e6e6",
    itemPrimaryHighlight: "#e6e6e6",
    itemPrimaryDefault: "#ffffff",
    itemPrimaryDefaultAlt1: "rgba(255, 255, 255, 0.8)",
    itemPrimaryDefaultAlt2: "rgba(255, 255, 255, 0.2)",

    mainPairedDefault: "#000000",
    mainPairedActive: "#333333",
  },
};

export default colors;
