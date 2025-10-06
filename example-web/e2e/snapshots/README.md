# Web Example Snapshots

This directory contains reference screenshots for visual regression testing with Playwright.

## Directory Structure

```
snapshots/
├── reference/          # Golden snapshots (committed to git)
│   ├── basic-test-png-capture-chromium-darwin.png
│   └── transparency-solid-capture-chromium-darwin.png
└── output/            # Test results (git ignored)
```

## Updating Snapshots

### Local Development

Run tests in update mode to regenerate all snapshots:

```bash
npm run test:e2e:update-snapshots
```

### From CI

When tests fail in CI due to visual changes:

1. Go to the failed GitHub Actions workflow
2. Download the `web-snapshots-reference` artifact
3. Extract the PNG files
4. Replace files in `example-web/e2e/snapshots/reference/`
5. Review the changes with `git diff`
6. Commit if the changes are expected

## Platform Notes

Snapshots are platform-specific (e.g., `-chromium-darwin.png`). The CI runs on Linux, so you may see different snapshot names in CI vs local macOS development.

For consistent CI testing, we use the snapshots generated on the CI platform (Linux + Chromium).
