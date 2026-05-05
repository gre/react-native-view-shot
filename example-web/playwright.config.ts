import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/snapshots/reference",
  // CI (Linux) writes/reads a single shared baseline; local non-Linux runs
  // get their own per-platform files so font/anti-aliasing diffs don't fail
  // local e2e and don't overwrite the committed Linux baseline.
  snapshotPathTemplate:
    process.env.CI || process.platform === "linux"
      ? "{snapshotDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}"
      : "{snapshotDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      // Higher quality snapshots
      scale: "css",
      animations: "disabled",
    },
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"]},
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run build && npx serve dist -l 3000",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
