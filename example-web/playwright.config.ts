import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/snapshots/reference",
  // Drop the `{platform}` segment so a single committed snapshot per test
  // is compared on every OS. Linux (CI) is the reference; running locally on
  // macOS may produce diffs because of font/anti-aliasing rendering. Devs
  // working on visual changes should regenerate snapshots from CI artifacts
  // (see docs in the snapshot-diff GitHub step) rather than committing
  // platform-specific copies.
  snapshotPathTemplate:
    "{snapshotDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
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
