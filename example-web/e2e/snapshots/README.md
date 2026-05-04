# Web Example Snapshots

Reference screenshots for visual regression testing with Playwright.

```
snapshots/
├── reference/
│   └── <spec-file>.ts-snapshots/   # Golden snapshots (committed)
│       └── <test-name>-chromium.png
└── output/                         # Test results (git-ignored)
```

The CI (Linux + Chromium) writes a single shared golden file per test,
which is what gets committed. Local non-Linux runs use a per-platform
file (`<name>-chromium-darwin.png` etc.) so font/anti-aliasing diffs
don't fail your local e2e and don't overwrite the committed Linux
baseline. Those local files are not committed.

## Updating snapshots

Baselines must be regenerated **on Linux only**.
`npm run test:e2e:update-snapshots` refuses to run on macOS / Windows
to prevent overwriting the committed Linux references.

The recommended flow is to update via CI artifacts:

1. Push your branch. CI runs Playwright; if your visual change made
   tests fail, the failing job uploads the rendered screenshots as the
   `web-snapshots-actual` artifact.
2. Download `web-snapshots-actual` from the failed GitHub Actions run.
3. For each `*-actual.png` file, copy it over the matching baseline
   under the corresponding `<spec-file>.ts-snapshots/` directory in
   `example-web/e2e/snapshots/reference/`, dropping the `-actual`
   suffix.
4. Review the diff with `git diff` (image diffs render in GitHub PRs).
5. Commit if the visual change is intended.

If you really need to regenerate locally (e.g. to bootstrap a brand new
test), do it inside a Linux container or VM; do not commit baselines
generated on macOS or Windows.
