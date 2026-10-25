package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.util.DisplayMetrics;
import android.view.View;
import android.widget.ScrollView;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.NativeViewHierarchyManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Output-dimension contract of an Android capture (#537, #505: "blurry"
 * captures, notably "when the height exceeds 1000").
 *
 * <p>Drives the real {@link ViewShot} capture path (UI block → executor →
 * draw → optional scale → compress) against mocked views, with
 * {@link Bitmap} statics mocked so we can observe which bitmap sizes are
 * allocated, scaled and finally encoded. Android {@code View} sizes are
 * already physical pixels (dp × density), so a capture without
 * width/height must encode exactly {@code view.getWidth() x getHeight()}
 * with no intermediate downscale, however tall the view.
 *
 * <p>The last group goes through {@link RNViewShotModule#captureRef} to pin
 * how the JS {@code width}/{@code height} options are interpreted. iOS
 * treats them as points (UIGraphicsImageRenderer with device scale, so the
 * output is points × scale); Android takes them as absolute pixels since
 * #414. Passing a view's dp size (as on iOS) therefore yields a 1/density
 * downscaled, blurry image on Android, unless the caller sets
 * {@code sizeUnit: "dp"} so JS converts to pixels first.
 */
public class CaptureDimensionsTest {

    /** A (width, height) pair passed to compress / createScaledBitmap. */
    private static final class Size {
        final int w;
        final int h;
        Size(int w, int h) { this.w = w; this.h = h; }
        @Override public String toString() { return w + "x" + h; }
    }

    // Static so pooled mock bitmaps (ViewShot keeps a static reuse pool)
    // created by an earlier test still record into the current test.
    private static final List<Size> encoded = new ArrayList<>();
    private static final List<Size> scaledTo = new ArrayList<>();
    private static final List<Boolean> scaleFilter = new ArrayList<>();
    private static final List<Size> allocated = new ArrayList<>();

    private MockedStatic<Bitmap> bitmapStatics;
    private MockedConstruction<Point> points;

    private static Bitmap bitmapOf(int w, int h) {
        final Bitmap b = mock(Bitmap.class);
        when(b.getWidth()).thenReturn(w);
        when(b.getHeight()).thenReturn(h);
        when(b.getByteCount()).thenReturn(w * h * 4);
        when(b.compress(any(), anyInt(), any())).thenAnswer(inv -> {
            encoded.add(new Size(w, h));
            return true;
        });
        return b;
    }

    @Before
    public void setUp() {
        encoded.clear();
        scaledTo.clear();
        scaleFilter.clear();
        allocated.clear();
        // android.graphics.Point is a no-op stub in the JVM (x/y stay 0);
        // ViewShot compares the requested width/height against it.
        points = mockConstruction(Point.class, (p, ctx) -> {
            if (ctx.arguments().size() == 2) {
                p.x = (Integer) ctx.arguments().get(0);
                p.y = (Integer) ctx.arguments().get(1);
            }
        });
        bitmapStatics = mockStatic(Bitmap.class);
        bitmapStatics.when(() -> Bitmap.createBitmap(anyInt(), anyInt(), any(Bitmap.Config.class)))
            .thenAnswer(inv -> {
                final int w = inv.getArgument(0);
                final int h = inv.getArgument(1);
                allocated.add(new Size(w, h));
                return bitmapOf(w, h);
            });
        bitmapStatics.when(() -> Bitmap.createScaledBitmap(any(Bitmap.class), anyInt(), anyInt(), anyBoolean()))
            .thenAnswer(inv -> {
                final int w = inv.getArgument(1);
                final int h = inv.getArgument(2);
                scaledTo.add(new Size(w, h));
                scaleFilter.add(inv.getArgument(3));
                return bitmapOf(w, h);
            });
    }

    @After
    public void tearDown() {
        bitmapStatics.close();
        points.close();
    }

    // ---- helpers ---------------------------------------------------------

    private static View viewPx(int w, int h) {
        final View v = mock(View.class);
        when(v.getWidth()).thenReturn(w);
        when(v.getHeight()).thenReturn(h);
        return v;
    }

    /** ScrollView of viewport (w, h) px holding one content child of contentH px. */
    private static ScrollView scrollViewPx(int w, int h, int contentH) {
        final ScrollView sv = mock(ScrollView.class);
        when(sv.getWidth()).thenReturn(w);
        when(sv.getHeight()).thenReturn(h);
        final View content = viewPx(w, contentH);
        when(sv.getChildCount()).thenReturn(1);
        when(sv.getChildAt(0)).thenReturn(content);
        return sv;
    }

    private static int px(double dp, double density) {
        return (int) Math.round(dp * density);
    }

    /**
     * Run a full capture of {@code view} through {@link ViewShot} (PNG,
     * base64 result) and return the size of the encoded bitmap.
     */
    private static Size capture(View view, Integer width, Integer height, boolean snapshotContentContainer) {
        final Promise promise = mock(Promise.class);
        final NativeViewHierarchyManager nvhm = mock(NativeViewHierarchyManager.class);
        when(nvhm.resolveView(7)).thenReturn(view);
        final ViewShot shot = new ViewShot(
            7, "png", ViewShot.Formats.PNG, 1.0, width, height, null,
            ViewShot.Results.BASE_64, snapshotContentContainer,
            mock(ReactApplicationContext.class), null, false, promise, Runnable::run);
        shot.execute(nvhm);
        verify(promise, never()).reject(anyString(), anyString());
        verify(promise, never()).reject(anyString(), anyString(), any(Throwable.class));
        verify(promise).resolve(any());
        assertEquals("exactly one bitmap encoded", 1, encoded.size());
        return encoded.get(0);
    }

    private static void assertSize(String what, int w, int h, Size actual) {
        assertEquals(what + " width (got " + actual + ")", w, actual.w);
        assertEquals(what + " height (got " + actual + ")", h, actual.h);
    }

    // ---- no width/height: full device resolution -------------------------

    @Test
    public void noSizeOptionsEncodesViewAtFullPixelSizeOn3xDevice() {
        // 360x640dp on a 3x (xxhdpi) device = 1080x1920px.
        final Size out = capture(viewPx(px(360, 3), px(640, 3)), null, null, false);
        assertSize("360x640dp @3x", 1080, 1920, out);
        assertTrue("no rescale without width/height", scaledTo.isEmpty());
    }

    @Test
    public void tallViewIsNotDownscaled() {
        // 360x3000dp @3x = 1080x9000px — far beyond the screen, must be kept.
        final Size out = capture(viewPx(px(360, 3), px(3000, 3)), null, null, false);
        assertSize("360x3000dp @3x", 1080, 9000, out);
        assertTrue("no rescale for tall views", scaledTo.isEmpty());
    }

    @Test
    public void viewTallerThan1000dpIsNotDownscaled() {
        // The #505 report: "blurry when the height exceeds 1000".
        // Pixel 3a density 2.75: 393x1200dp = 1081x3300px.
        final Size out = capture(viewPx(px(393, 2.75), px(1200, 2.75)), null, null, false);
        assertSize("393x1200dp @2.75x", 1081, 3300, out);
        assertTrue(scaledTo.isEmpty());
    }

    @Test
    public void allocatedCanvasBitmapMatchesViewPixelSize() {
        // Guards against drawing into a smaller bitmap and scaling up.
        // Odd size so the static bitmap reuse pool cannot serve it.
        capture(viewPx(1081, 9001), null, null, false);
        assertEquals(1, allocated.size());
        assertSize("allocated", 1081, 9001, allocated.get(0));
    }

    @Test
    public void snapshotContentContainerOnTallScrollViewEncodesFullContent() {
        // ScrollView 360x640dp viewport, 3000dp content @3x.
        final Size out = capture(scrollViewPx(1080, 1920, 9000), null, null, true);
        assertSize("ScrollView content 360x3000dp @3x", 1080, 9000, out);
        assertTrue(scaledTo.isEmpty());
    }

    // ---- explicit width/height at the ViewShot level (pixels) ------------

    @Test
    public void explicitSizeEqualToViewSizeDoesNotRescale() {
        final Size out = capture(viewPx(1080, 1920), 1080, 1920, false);
        assertSize("same size", 1080, 1920, out);
        assertTrue("unexpected rescale to " + scaledTo, scaledTo.isEmpty());
    }

    @Test
    public void explicitSizeRescalesWithBilinearFilter() {
        final Size out = capture(viewPx(1080, 1920), 540, 960, false);
        assertSize("half size", 540, 960, out);
        assertEquals(1, scaledTo.size());
        assertTrue("createScaledBitmap must filter", scaleFilter.get(0));
    }

    @Test
    public void onlyOneOfWidthHeightIsIgnored() {
        // Documents current behaviour: width without height is a no-op.
        final Size out = capture(viewPx(1080, 1920), 540, null, false);
        assertSize("width only", 1080, 1920, out);
        assertTrue(scaledTo.isEmpty());
    }

    // ---- JS width/height → native: dp (iOS parity) vs px -----------------

    /**
     * Run {@link RNViewShotModule#captureRef} with the given JS options, grab
     * the arguments it constructs its {@link ViewShot} UI block with, and
     * replay a real capture with them. (The UI-manager dispatch is not
     * exercised: FabricUIManager cannot be loaded in a plain JVM.)
     */
    private static Size captureViaModule(View view, float density, Double width, Double height) {
        final ReactApplicationContext ctx = mock(ReactApplicationContext.class);
        final Resources res = mock(Resources.class);
        final DisplayMetrics dm = new DisplayMetrics();
        dm.density = density;
        when(ctx.getResources()).thenReturn(res);
        when(res.getDisplayMetrics()).thenReturn(dm);

        final ReadableMap options = mock(ReadableMap.class);
        when(options.getString("format")).thenReturn("png");
        when(options.getDouble("quality")).thenReturn(1.0);
        when(options.getString("result")).thenReturn("base64");
        when(options.getBoolean("snapshotContentContainer")).thenReturn(false);
        if (width != null) {
            when(options.hasKey("width")).thenReturn(true);
            when(options.getDouble("width")).thenReturn(width);
            when(options.getInt("width")).thenReturn((int) (double) width);
        }
        if (height != null) {
            when(options.hasKey("height")).thenReturn(true);
            when(options.getDouble("height")).thenReturn(height);
            when(options.getInt("height")).thenReturn((int) (double) height);
        }

        final AtomicReference<List<?>> ctorArgs = new AtomicReference<>();
        try (MockedConstruction<ViewShot> ignored = mockConstruction(ViewShot.class,
                (mock, context) -> ctorArgs.set(new ArrayList<>(context.arguments())))) {
            // UI-manager lookup fails after the block is built (no Fabric in
            // a JVM); the module catches that and rejects, which is fine here.
            new RNViewShotModule(ctx).captureRef(7.0, options, mock(Promise.class));
        }
        final List<?> a = ctorArgs.get();
        assertNotNull("RNViewShotModule did not build a ViewShot", a);
        final Integer scaleWidth = (Integer) a.get(4);
        final Integer scaleHeight = (Integer) a.get(5);
        return capture(view, scaleWidth, scaleHeight, false);
    }

    @Test
    public void moduleWithoutSizeOptionsEncodesFullPixelSize() {
        final Size out = captureViaModule(viewPx(1080, 1920), 3f, null, null);
        assertSize("no options @3x", 1080, 1920, out);
    }

    @Test
    public void widthHeightArePixelsByDefault() {
        // Android's native unit for width/height is pixels (#414), unlike
        // iOS (points). Passing a 360x640dp view's dp size therefore yields
        // a 1/3 downscale at 3x. JS converts when `sizeUnit: "dp"` is set
        // (src/index.tsx), so native keeps receiving pixels.
        final Size out = captureViaModule(viewPx(1080, 1920), 3f, 360.0, 640.0);
        assertSize("width/height 360x640 @3x", 360, 640, out);
    }

    @Test
    public void widthHeightAlreadyConvertedFromDpGiveFullResolution() {
        // What JS sends for { width: 360, height: 640, sizeUnit: "dp" } at 3x.
        final Size out = captureViaModule(viewPx(1080, 1920), 3f, 1080.0, 1920.0);
        assertSize("width/height 1080x1920 @3x", 1080, 1920, out);
        assertTrue(scaledTo.isEmpty());
    }
}
