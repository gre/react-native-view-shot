# Playwright Snapshot Management Scripts

## Update Snapshots from CI

When the CI generates new snapshots for Linux (chromium-linux), you can easily integrate them into the project using this script.

### Usage

```bash
./scripts/update-snapshots-from-ci.sh <RUN_ID>
```

### Example

1. Go to the failed CI run on GitHub Actions
2. Copy the run ID from the URL (e.g., `18528005182`)
3. Run:
   ```bash
   cd example-web
   ./scripts/update-snapshots-from-ci.sh 18528005182
   ```

### Prerequisites

- [GitHub CLI](https://cli.github.com/) installed and authenticated
- The CI run must have completed and uploaded the `web-snapshots-actual` artifact

### What it does

1. Downloads the `web-snapshots-actual` artifact from the specified CI run
2. Extracts the snapshots
3. Copies them to `e2e/snapshots/reference/viewshot.spec.ts-snapshots/`
4. Renames `-actual.png` files to the standard naming convention

### After running

1. Review changes: `git diff e2e/snapshots/reference/`
2. Commit: `git add e2e/snapshots/reference/ && git commit -m "Update Linux snapshots from CI"`
3. Push: `git push`

The next CI run will use these new reference snapshots and should pass ✅
