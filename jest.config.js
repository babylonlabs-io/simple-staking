/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: { "\\.(m?j|t)sx?$": ["babel-jest"] },
  // transform: {
  //   "^.+\\.(js|jsx|ts|tsx)?$": [
  //     "ts-jest",
  //     {
  //       tsconfig: "tsconfig.test.json",
  //       useESM: true
  //     },
  //   ],
  // },
  transformIgnorePatterns: [
    "\\/node_modules\\/(?!(@bitcoin-js/tiny-secp256k1-asmjs|uint8array-tools)/)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "cjs"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
  setupFiles: ["./jest.setup.js"],
};
