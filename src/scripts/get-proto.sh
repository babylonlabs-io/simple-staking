#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

# Define variables
SCRIPTS_DIR="src/scripts"
PROTO_DIR="$SCRIPTS_DIR/proto"
BABYLON_REPO_DIR="babylon"
BABYLON_PROTO="$BABYLON_REPO_DIR/proto"
BABYLON_REPO_URL="https://github.com/babylonchain/babylon.git"

# Clone the Babylon repo with depth 1 to minimize download size
echo "Cloning the Babylon repo from $BABYLON_REPO_URL"
git clone --depth 1 "$BABYLON_REPO_URL" "$BABYLON_REPO_DIR"

# Copy proto files
cp -r "$BABYLON_PROTO" "$PROTO_DIR"
echo "Compiling Babylon proto files to TS files"
cd "$SCRIPTS_DIR" && npx buf generate proto
cd ../..

# Clean up
rm -r "$PROTO_DIR"
rm -rf "$BABYLON_REPO_DIR"

echo "Build completed and Babylon repo removed."
