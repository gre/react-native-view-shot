# Web Example Snapshots

Reference screenshots for visual regression testing with Playwright.

```
snapshots/
├── reference/
│   └── viewshot.spec.ts-snapshots/   # Golden snapshots (committed to git)
│       ├── basic-test-png-capture-chromium.png
│       └── ...
└── output/                           # Test results (git-ignored)
```

A single golden file per test is committed regardless of OS (no
`-darwin` / `-linux` suffix). The CI runs on Linux + Chromium and is the
source of truth — local macOS or Windows runs will produce visual diffs
because of font and anti-aliasing differences. That's expected.

## Updating snapshots

Snapshot baselines must be regenerated **on Linux only** (the CI
platform). The `npm run test:e2e:update-snapshots` script enforces this
locally — it refuses to run on macOS / Windows because the resulting
files would differ from the committed Linux baselines and fail CI on
the next run.

The recommended flow is to update via CI artifacts:

1. Push your branch. CI runs Playwright; if your visual change made
   tests fail, the failing job uploads the rendered screenshots as the
   `web-snapshots-actual` artifact.
2. Download `web-snapshots-actual` from the failed GitHub Actions run.
3. For each `*-actual.png` file, copy it over the matching baseline in
   `example-web/e2e/snapshots/reference/viewshot.spec.ts-snapshots/`,
   dropping the `-actual` suffix.
4. Review the diff with `git diff` (image diffs render in GitHub PRs).
5. Commit if the visual change is intended.

If you really need to regenerate locally (e.g. to bootstrap a brand new
test), do it inside a Linux container or VM; do not commit baselines
generated on macOS or Windows.
