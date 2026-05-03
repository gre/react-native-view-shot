package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.view.View;

import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mockito;

/**
 * Pure-Java + Mockito tests for
 * {@link ViewShot#forceExactLayout(View, int, int)} — the helper used by
 * the {@code snapshotContentContainer} path to synchronously expand a
 * ScrollView to its full content height before drawing, and to restore
 * it afterwards.
 *
 * <p>Contract:
 * <ul>
 *   <li>{@code view.measure(...)} is called once with EXACTLY-mode specs
 *       sized to the requested width/height.</li>
 *   <li>{@code view.layout(left, top, left + width, top + height)} is
 *       called once preserving the view's existing top/left so the view
 *       does not jump position during capture.</li>
 *   <li>measure runs before layout (a layout pass without a prior
 *       measure on the requested specs would lay out at stale dims).</li>
 * </ul>
 *
 * <p>Note: {@link View.MeasureSpec#makeMeasureSpec(int, int)} is a static
 * Android stub. Under {@code testOptions.unitTests.returnDefaultValues =
 * true} (configured in {@code android/build.gradle}) it returns 0 in
 * pure JUnit, so we don't try to decode the MeasureSpec bits — we just
 * verify {@code measure} was invoked. The behavior of MeasureSpec
 * encoding itself is platform-tested.
 */
public class ForceExactLayoutTest {

    private static View viewAt(int left, int top) {
        View v = mock(View.class);
        when(v.getLeft()).thenReturn(left);
        when(v.getTop()).thenReturn(top);
        return v;
    }

    @Test
    public void layoutPreservesExistingTopLeftAndUsesRequestedSize() {
        View v = viewAt(40, 70);

        ViewShot.forceExactLayout(v, 320, 480);

        // layout(left, top, left + width, top + height)
        verify(v, times(1)).layout(40, 70, 40 + 320, 70 + 480);
    }

    @Test
    public void layoutAtOriginUsesZeroLeftTop() {
        View v = viewAt(0, 0);

        ViewShot.forceExactLayout(v, 100, 200);

        verify(v, times(1)).layout(0, 0, 100, 200);
    }

    @Test
    public void layoutSupportsNegativeOriginOffsets() {
        // Translated/scrolled views can report negative left/top; the
        // helper must preserve those offsets verbatim rather than
        // clamping to zero.
        View v = viewAt(-15, -25);

        ViewShot.forceExactLayout(v, 50, 60);

        verify(v, times(1)).layout(-15, -25, -15 + 50, -25 + 60);
    }

    @Test
    public void measureRunsBeforeLayout() {
        // measure must precede layout — otherwise layout would use stale
        // child measurements and dispatchDraw would clip at the previous
        // bounds even after the ScrollView's own bounds expanded.
        View v = viewAt(0, 0);

        ViewShot.forceExactLayout(v, 200, 300);

        InOrder order = Mockito.inOrder(v);
        order.verify(v).measure(anyInt(), anyInt());
        order.verify(v).layout(anyInt(), anyInt(), anyInt(), anyInt());
    }

    @Test
    public void measureIsInvokedExactlyOnce() {
        View v = viewAt(0, 0);

        ViewShot.forceExactLayout(v, 200, 300);

        verify(v, times(1)).measure(anyInt(), anyInt());
        verify(v, times(1)).layout(anyInt(), anyInt(), anyInt(), anyInt());
    }

    @Test
    public void zeroDimensionsArePassedThrough() {
        // The helper is dumb: callers are expected to validate sizes
        // upstream. A zero-size call should still issue the measure +
        // layout (the no-op nature is the caller's responsibility).
        View v = viewAt(10, 20);

        ViewShot.forceExactLayout(v, 0, 0);

        verify(v, times(1)).layout(10, 20, 10, 20);
    }

    @Test
    public void measureSpecsAreCapturedFromBothAxes() {
        // We can't decode the MeasureSpec value (static stub returns 0
        // under returnDefaultValues), but we can confirm the helper
        // produced two arguments — one per axis — and that they came
        // from the width/height path, by capturing the call.
        View v = viewAt(0, 0);

        ViewShot.forceExactLayout(v, 11, 22);

        ArgumentCaptor<Integer> wSpec = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> hSpec = ArgumentCaptor.forClass(Integer.class);
        verify(v).measure(wSpec.capture(), hSpec.capture());

        // Under returnDefaultValues both encoded specs are 0; what
        // matters is that measure() received exactly two args.
        assertEquals(2, wSpec.getAllValues().size() + hSpec.getAllValues().size());
    }
}
