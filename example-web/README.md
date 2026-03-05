# React Native View Shot - Web Example

Web example demonstrating `react-native-view-shot` in browsers using `html2canvas`.

## Quick Start

```bash
npm install
npm start
```

Opens at `http://localhost:3000`

## What's Included

- **Basic ViewShot**: Simple captures with PNG/JPG formats and Base64/Data URI output
- **Transparency Test**: PNG transparency support (with html2canvas limitations)
- **Image Capture**: Views with styled elements and colors
- **Complex Layouts**: Nested views with flexbox, shadows, borders, and gradients

## Usage Example

```typescript
import {captureRef} from "react-native-view-shot";

const viewRef = useRef(null);

const capture = async () => {
  const uri = await captureRef(viewRef.current, {
    format: "png",
    quality: 0.9,
    result: "data-uri",
  });
  console.log("Captured:", uri);
};
```

## Tech Stack

- React Native Web for cross-platform components
- html2canvas for web screenshot capture
- Webpack for bundling
- TypeScript for type safety

## Web Limitations

- `result: 'tmpfile'` falls back to 'data-uri' (with warning)
- `snapshotContentContainer` not implemented
- Transparency edge cases due to html2canvas
- CORS restrictions on external images

## Build

```bash
npm run build    # Production build in dist/
npm run clean    # Remove dist/
```

## Testing

### Automated E2E Tests (Playwright)

The web example has comprehensive Playwright tests that run in CI:

```bash
npm run test:e2e         # Run tests headless
npm run test:e2e:headed  # Run tests with visible browser
```

**Tests verify:**

- ✅ App loads and navigation works
- ✅ PNG capture functionality
- ✅ JPG capture functionality
- ✅ Base64 output format
- ✅ All screens render correctly
- ✅ Images are actually generated

Tests run automatically in GitHub Actions CI with Chromium.

### Manual Testing

For local development and debugging:

1. **Start dev server:** `npm start`
2. **Open browser:** `http://localhost:3000`
3. **Test capture:**
   - Click "Basic ViewShot"
   - Click "📸 PNG (Data URI)"
   - Verify image appears
   - Try download functionality

### CI Pipeline

See `.github/workflows/ci.yml` - the `test-web-example` job runs all Playwright tests in headless Chromium.

**CI Artifacts:**

- `web-snapshots-reference`: Current reference snapshots (download to update local snapshots)
- `web-snapshots-diff`: Visual diffs when tests fail (actual vs expected)
- `playwright-report`: Full HTML test report
- `playwright-test-results`: Detailed test results

**When snapshots differ:**

- The CI will show a clear message in the GitHub Actions summary
- Download the `web-snapshots-reference` artifact
- Replace `example-web/e2e/snapshots/reference/` with the downloaded files
- Commit the updated snapshots

**Note:** Snapshots are platform-specific (Linux vs macOS). The CI runs on Linux, so you may need to update snapshots when running locally on macOS.

## Related

- [Main Library](../)
- [Native Example](../example/)
- [html2canvas](https://html2canvas.hertzen.com/)
