#!/bin/bash

# Script to update Linux snapshots from CI artifacts
# Usage: ./scripts/update-snapshots-from-ci.sh <run-id>

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Please provide a GitHub Actions run ID"
  echo "Usage: $0 <run-id>"
  echo ""
  echo "Example: $0 18528005182"
  echo ""
  echo "Find the run ID in the GitHub Actions URL:"
  echo "https://github.com/gre/react-native-view-shot/actions/runs/<RUN_ID>"
  exit 1
fi

RUN_ID=$1
ARTIFACT_NAME="web-snapshots-actual"
SNAPSHOT_DIR="e2e/snapshots/reference/viewshot.spec.ts-snapshots"

echo "🔍 Fetching artifacts from run $RUN_ID..."

# Download the artifact
cd "$(dirname "$0")/.."
gh run download "$RUN_ID" -n "$ARTIFACT_NAME" -D /tmp/playwright-snapshots || {
  echo "❌ Failed to download artifact '$ARTIFACT_NAME'"
  echo ""
  echo "💡 Make sure:"
  echo "  1. The run ID is correct"
  echo "  2. The artifact exists (may take a few minutes after test completion)"
  echo "  3. You have GitHub CLI (gh) installed and authenticated"
  exit 1
}

echo "✅ Artifact downloaded to /tmp/playwright-snapshots"

# Create snapshot directory if it doesn't exist
mkdir -p "$SNAPSHOT_DIR"

# Copy actual snapshots to reference directory
if [ -d "/tmp/playwright-snapshots" ]; then
  echo "📂 Copying snapshots to $SNAPSHOT_DIR..."
  
  # Find all PNG files and copy them
  find /tmp/playwright-snapshots -name "*.png" | while read -r file; do
    filename=$(basename "$file")
    
    # If it's an -actual.png file, rename it to the standard name
    if [[ $filename == *"-actual.png" ]]; then
      newname="${filename%-actual.png}.png"
      echo "  → $newname"
      cp "$file" "$SNAPSHOT_DIR/$newname"
    else
      echo "  → $filename"
      cp "$file" "$SNAPSHOT_DIR/$filename"
    fi
  done
  
  echo ""
  echo "✅ Snapshots updated successfully!"
  echo ""
  echo "📋 Next steps:"
  echo "  1. Review the changes: git diff $SNAPSHOT_DIR"
  echo "  2. Commit the new snapshots: git add $SNAPSHOT_DIR && git commit -m 'Update Linux snapshots from CI'"
  echo "  3. Push: git push"
  
  # Clean up
  rm -rf /tmp/playwright-snapshots
else
  echo "❌ No snapshots found in artifact"
  exit 1
fi

