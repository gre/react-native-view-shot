#!/bin/bash
# Import actual Linux snapshots from one GitHub Actions run.
set -euo pipefail

if [ "$#" -ne 1 ] || [[ ! $1 =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 <numeric-run-id>" >&2
  exit 1
fi

RUN_ID=$1
ARTIFACT_NAME="web-snapshots-actual"
SNAPSHOT_DIR="e2e/snapshots/reference/viewshot.spec.ts-snapshots"
DOWNLOAD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/viewshot-snapshots.XXXXXX")
trap 'rm -rf -- "$DOWNLOAD_DIR"' EXIT

cd "$(dirname "$0")/.."
echo "Fetching $ARTIFACT_NAME from run $RUN_ID..."
gh run download "$RUN_ID" -n "$ARTIFACT_NAME" -D "$DOWNLOAD_DIR/artifact"

# Validate all destinations before changing any checked-in reference image.
mkdir "$DOWNLOAD_DIR/staged"
count=0
while IFS= read -r -d '' file; do
  filename=${file##*/}
  destination="$DOWNLOAD_DIR/staged/${filename%-actual.png}.png"
  if [ -e "$destination" ]; then
    echo "Duplicate snapshot destination: ${filename%-actual.png}.png" >&2
    exit 1
  fi
  cp "$file" "$destination"
  count=$((count + 1))
done < <(find "$DOWNLOAD_DIR/artifact" -type f -name '*-actual.png' -print0)

if [ "$count" -eq 0 ]; then
  echo "No actual snapshots found in artifact." >&2
  exit 1
fi

mkdir -p "$SNAPSHOT_DIR"
cp "$DOWNLOAD_DIR/staged/"*.png "$SNAPSHOT_DIR/"
echo "Updated $count snapshots. Review git diff -- $SNAPSHOT_DIR before committing."
