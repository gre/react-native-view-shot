# ViewShot E2E tests

- `viewshot-all-screens.test.js`: navigates to each example screen, captures
  and compares the preview with a reference snapshot.
- `resize.test.js`: `width`/`height` resize cases; the screen decodes each
  capture and the test asserts every case reports PASS.
- `snapshot-content-container.test.js`: `snapshotContentContainer` on a
  ScrollView, compared with a reference snapshot.
- `style-filters.test.js`: `filter` styles (#578), compared with a reference
  snapshot of the current (partially unfiltered) output.

Helpers live in `../helpers/`: `test-actions.js` (navigation/scrolling) and
`snapshot-matcher.js` (`expectSnapshot(name, matcher)`).

## Snapshots

`expectSnapshot` takes an element screenshot of `matcher` (use the
`capture-preview` image) and compares it with
`../snapshots/reference/<platform>/<name>.png`. Screens whose capture is not
deterministic (Full Screen, Video, SVG URI) only assert the success text.

```bash
npm run test:e2e:ios                     # compare
npm run test:e2e:ios:update-snapshots    # rewrite references (UPDATE_SNAPSHOTS=true)
```

On a mismatch or missing reference the test fails and writes
`<name>.actual.png` / `<name>.diff.png` to `../snapshots/output/<platform>/`.
See `../README.md` for where iOS references must come from.
