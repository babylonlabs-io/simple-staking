#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";

// Get ts-prune output
const tsPruneOutput = execSync("ts-prune --project tsconfig.app.json", {
  encoding: "utf8",
});

// Parse the output to get unused exports
const unusedExports = tsPruneOutput
  .split("\n")
  .filter((line) => line.trim() && !line.includes("used in module"))
  .map((line) => {
    const match = line.match(/^(.+):(\d+) - (.+)$/);
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        export: match[3],
      };
    }
    return null;
  })
  .filter(Boolean);

console.log(`Found ${unusedExports.length} potentially unused exports\n`);

// Function to search for usage of an export
function searchForUsage(exportName, filePath) {
  try {
    // Search for the export name in the codebase
    const grepOutput = execSync(
      `grep -r "${exportName}" src/ --include="*.ts" --include="*.tsx"`,
      { encoding: "utf8" },
    );
    const lines = grepOutput.split("\n").filter((line) => line.trim());

    // Filter out the export declaration itself and count actual usages
    const usages = lines.filter((line) => {
      const file = line.split(":")[0];
      return file !== filePath && !line.includes(`export.*${exportName}`);
    });

    return usages.length;
  } catch (error) {
    // grep returns non-zero exit code when no matches found
    return 0;
  }
}

// Check each potentially unused export
const trulyUnused = [];
const actuallyUsed = [];

for (const item of unusedExports) {
  const usageCount = searchForUsage(item.export, item.file);

  if (usageCount === 0) {
    trulyUnused.push(item);
  } else {
    actuallyUsed.push({ ...item, usageCount });
  }
}

console.log(`\n=== TRULY UNUSED EXPORTS (${trulyUnused.length}) ===`);
trulyUnused.forEach((item) => {
  console.log(`${item.file}:${item.line} - ${item.export}`);
});

console.log(`\n=== FALSE POSITIVES (${actuallyUsed.length}) ===`);
actuallyUsed.forEach((item) => {
  console.log(
    `${item.file}:${item.line} - ${item.export} (used ${item.usageCount} times)`,
  );
});

// Save results to files
fs.writeFileSync(
  "truly-unused-exports.txt",
  trulyUnused
    .map((item) => `${item.file}:${item.line} - ${item.export}`)
    .join("\n"),
);

fs.writeFileSync(
  "false-positives.txt",
  actuallyUsed
    .map(
      (item) =>
        `${item.file}:${item.line} - ${item.export} (used ${item.usageCount} times)`,
    )
    .join("\n"),
);

console.log(
  `\nResults saved to truly-unused-exports.txt and false-positives.txt`,
);
