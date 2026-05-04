if (process.platform !== "linux") {
  console.error(
    "\n  Snapshot baselines must be regenerated on Linux (the CI platform).\n" +
      "  On macOS / Windows the renders differ enough to overwrite the committed Linux baselines and fail CI.\n\n" +
      "  Push your branch and grab the web-snapshots-actual artifact from the failing CI run\n" +
      "  (see example-web/e2e/snapshots/README.md).\n",
  );
  process.exit(1);
}
