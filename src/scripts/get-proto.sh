#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

SCRIPTS_DIR="src/scripts"
PROTO_DIR="$SCRIPTS_DIR/proto"
BABYLON_PROTO="babylon/proto"

cp -r "$BABYLON_PROTO" "$PROTO_DIR"
echo "Compiling Babylon proto files to TS files"
cd "$SCRIPTS_DIR" && npx buf generate proto
cd ../..
rm -r "$PROTO_DIR"
