package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Point;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.view.PixelCopy;
import android.view.View;
import android.view.Window;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.NativeViewHierarchyManager;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * captureScreen (tag -1) prefers a PixelCopy window snapshot over the
 * view.draw + TextureView-overlay walk, so TextureView/SurfaceView content
 * (e.g. a map) keeps the compositor's z-order under the views drawn above
 * it instead of being repainted on top (#492, #150).
 *
 * <p>Drives the real {@link ViewShot} capture path with mocked views and
 * mocked framework statics. Pins the two contracts that make the window
 * path safe to keep on by default: a successful copy never runs
 * view.draw, and any PixelCopy failure or timeout still resolves via the
 * existing view.draw fallback.
 */
public class CaptureScreenPixelCopyTest {

    private static final List<int[]> encoded = new ArrayList<>();

    private MockedStatic<Bitmap> bitmapStatics;
    private MockedStatic<PixelCopy> pixelCopyStatics;
    private MockedStatic<Looper> looperStatics;
    private MockedConstruction<Point> points;
    private MockedConstruction<Rect> rects;
    private MockedConstruction<Handler> handlers;

    /** When false the PixelCopy.request stub never invokes the listener (timeout path). */
    private final AtomicBoolean deliverCopyResult = new AtomicBoolean(true);
    private int copyResultToDeliver = PixelCopy.SUCCESS;

    private static Bitmap bitmapOf(int w, int h) {
        final Bitmap b = mock(Bitmap.class);
        when(b.getWidth()).thenReturn(w);
        when(b.getHeight()).thenReturn(h);
        when(b.getByteCount()).thenReturn(w * h * 4);
        when(b.compress(any(), anyInt(), any())).thenAnswer(inv -> {
            encoded.add(new int[]{w, h});
            return true;
        });
        return b;
    }

    @Before
    public void setUp() {
        encoded.clear();
        deliverCopyResult.set(true);
        copyResultToDeliver = PixelCopy.SUCCESS;
        // android.graphics.Point/Rect are no-op stubs in the JVM (fields stay
        // 0); emulate them from the constructor arguments like
        // CaptureDimensionsTest does for Point.
        points = mockConstruction(Point.class, (p, ctx) -> {
            if (ctx.arguments().size() == 2) {
                p.x = (Integer) ctx.arguments().get(0);
                p.y = (Integer) ctx.arguments().get(1);
            }
        });
        rects = mockConstruction(Rect.class, (r, ctx) -> {
            if (ctx.arguments().size() == 4) {
                r.left = (Integer) ctx.arguments().get(0);
                r.top = (Integer) ctx.arguments().get(1);
                r.right = (Integer) ctx.arguments().get(2);
                r.bottom = (Integer) ctx.arguments().get(3);
            }
            when(r.width()).thenAnswer(inv -> r.right - r.left);
            when(r.height()).thenAnswer(inv -> r.bottom - r.top);
            when(r.isEmpty()).thenAnswer(inv -> r.left >= r.right || r.top >= r.bottom);
        });
        looperStatics = mockStatic(Looper.class);
        final Looper mainLooper = mock(Looper.class);
        looperStatics.when(Looper::getMainLooper).thenReturn(mainLooper);
        // runOnUiThreadBlocking posts the geometry read to the main looper;
        // run it inline so the capture stays synchronous in the test.
        handlers = mockConstruction(Handler.class, (h, ctx) ->
            when(h.post(any(Runnable.class))).thenAnswer(inv -> {
                ((Runnable) inv.getArgument(0)).run();
                return true;
            }));
        bitmapStatics = mockStatic(Bitmap.class);
        bitmapStatics.when(() -> Bitmap.createBitmap(anyInt(), anyInt(), any(Bitmap.Config.class)))
            .thenAnswer(inv -> bitmapOf(inv.getArgument(0), inv.getArgument(1)));
        bitmapStatics.when(() -> Bitmap.createScaledBitmap(any(Bitmap.class), anyInt(), anyInt(), anyBoolean()))
            .thenAnswer(inv -> bitmapOf(inv.getArgument(1), inv.getArgument(2)));
        pixelCopyStatics = mockStatic(PixelCopy.class);
        pixelCopyStatics.when(() -> PixelCopy.request(
                any(Window.class), any(Rect.class), any(Bitmap.class),
                any(PixelCopy.OnPixelCopyFinishedListener.class), any(Handler.class)))
            .thenAnswer(inv -> {
                if (deliverCopyResult.get()) {
                    inv.getArgument(3, PixelCopy.OnPixelCopyFinishedListener.class)
                        .onPixelCopyFinished(copyResultToDeliver);
                }
                return PixelCopy.SUCCESS;
            });
    }

    @After
    public void tearDown() {
        pixelCopyStatics.close();
        bitmapStatics.close();
        handlers.close();
        looperStatics.close();
        rects.close();
        points.close();
    }

    // ---- helpers ---------------------------------------------------------

    /** Content view behind android.R.id.content: 1079x1919 at window (0, 100). */
    private static View contentViewPx() {
        final View v = mock(View.class);
        when(v.getWidth()).thenReturn(1079);
        when(v.getHeight()).thenReturn(1919);
        doAnswer(inv -> {
            final int[] loc = inv.getArgument(0);
            loc[0] = 0;
            loc[1] = 100;
            return null;
        }).when(v).getLocationInWindow(any(int[].class));
        return v;
    }

    private static Activity activityShowing(View contentView) {
        final View decorView = mock(View.class);
        doReturn(contentView).when(decorView).findViewById(anyInt());
        final Window window = mock(Window.class);
        when(window.getDecorView()).thenReturn(decorView);
        final Activity activity = mock(Activity.class);
        when(activity.getWindow()).thenReturn(window);
        return activity;
    }

    /**
     * Run a captureScreen (tag -1) capture through the real ViewShot path,
     * forcing the window-PixelCopy branch: JVM unit tests run with
     * SDK_INT == 0, so the API-26 gate is bypassed via an anonymous subclass.
     */
    private static void captureScreen(Activity activity, Promise promise) {
        final ViewShot shot = new ViewShot(
            -1, "png", ViewShot.Formats.PNG, 1.0, null, null, null,
            ViewShot.Results.BASE_64, false,
            mock(ReactApplicationContext.class), activity, false, promise, Runnable::run) {
            @Override
            boolean useWindowPixelCopy() {
                return true;
            }
        };
        shot.execute(mock(NativeViewHierarchyManager.class));
    }

    private static void assertResolved(Promise promise) {
        verify(promise, never()).reject(anyString(), anyString());
        verify(promise, never()).reject(anyString(), anyString(), any(Throwable.class));
        verify(promise).resolve(any());
        assertEquals("exactly one bitmap encoded", 1, encoded.size());
    }

    // ---- contracts --------------------------------------------------------

    @Test
    public void successfulWindowCopySkipsViewDraw() {
        final View contentView = contentViewPx();
        final Promise promise = mock(Promise.class);
        captureScreen(activityShowing(contentView), promise);

        assertResolved(promise);
        // The window snapshot replaces the view.draw + overlay walk entirely.
        verify(contentView, never()).draw(any(Canvas.class));
    }

    @Test
    public void failedWindowCopyFallsBackToViewDraw() {
        copyResultToDeliver = PixelCopy.ERROR_SOURCE_NO_DATA;
        final View contentView = contentViewPx();
        final Promise promise = mock(Promise.class);
        captureScreen(activityShowing(contentView), promise);

        assertResolved(promise);
        verify(contentView).draw(any(Canvas.class));
        assertEquals("fallback encodes the view size", 1079, encoded.get(0)[0]);
        assertEquals("fallback encodes the view size", 1919, encoded.get(0)[1]);
    }

    @Test
    public void timedOutWindowCopyFallsBackToViewDraw() {
        deliverCopyResult.set(false);
        final View contentView = contentViewPx();
        final Promise promise = mock(Promise.class);
        captureScreen(activityShowing(contentView), promise);

        assertResolved(promise);
        verify(contentView).draw(any(Canvas.class));
    }

    @Test
    public void captureRefKeepsTheViewDrawPath() {
        // A non-screen tag must never take the window path: a window crop of
        // a partially covered view would capture the occluding content.
        final View view = contentViewPx();
        final Promise promise = mock(Promise.class);
        final NativeViewHierarchyManager nvhm = mock(NativeViewHierarchyManager.class);
        when(nvhm.resolveView(7)).thenReturn(view);
        final ViewShot shot = new ViewShot(
            7, "png", ViewShot.Formats.PNG, 1.0, null, null, null,
            ViewShot.Results.BASE_64, false,
            mock(ReactApplicationContext.class), activityShowing(mock(View.class)),
            false, promise, Runnable::run);
        shot.execute(nvhm);

        assertResolved(promise);
        pixelCopyStatics.verify(() -> PixelCopy.request(
            any(Window.class), any(Rect.class), any(Bitmap.class),
            any(PixelCopy.OnPixelCopyFinishedListener.class), any(Handler.class)),
            never());
        verify(view).draw(any(Canvas.class));
    }
}
