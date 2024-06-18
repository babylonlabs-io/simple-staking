module.exports = function (api) {
  const isTest = api.env("test") || process.env.JEST_ENV === "true";
  if (!isTest) return {}; // Don't need to do anything for non-test environments
  const presets = [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ];
  const plugins = [
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          "@": "./src",
        },
      },
    ],
  ];

  return {
    presets,
    plugins,
  };
};
