package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.view.View;

import org.junit.Test;

/**
 * Pure-Java tests for {@link ViewShot#proposeSize(View)}.
 *
 * The current contract is {@code Math.min(w * h * ARGB_SIZE, 32)} where
 * ARGB_SIZE == 4 — i.e. it caps at 32 bytes, used as the seed
 * pre-allocation for {@link ViewShot.ReusableByteArrayOutputStream}.
 * The output stream is then grown lazily by writes.
 */
public class ProposeSizeTest {

    private static View viewOfSize(int w, int h) {
        View v = mock(View.class);
        when(v.getWidth()).thenReturn(w);
        when(v.getHeight()).thenReturn(h);
        return v;
    }

    @Test
    public void zeroSizedViewReturnsZero() {
        // 0 * 0 * 4 = 0; min(0, 32) = 0
        assertEquals(0, ViewShot.proposeSize(viewOfSize(0, 0)));
    }

    @Test
    public void zeroWidthOrHeightReturnsZero() {
        assertEquals(0, ViewShot.proposeSize(viewOfSize(0, 100)));
        assertEquals(0, ViewShot.proposeSize(viewOfSize(100, 0)));
    }

    @Test
    public void smallViewBelowCapReturnsRawArgbSize() {
        // 2 * 2 * 4 = 16, below cap of 32
        assertEquals(16, ViewShot.proposeSize(viewOfSize(2, 2)));
        // 1 * 1 * 4 = 4
        assertEquals(4, ViewShot.proposeSize(viewOfSize(1, 1)));
    }

    @Test
    public void exactCapBoundaryReturnsCap() {
        // 8 * 1 * 4 = 32, equals cap
        assertEquals(32, ViewShot.proposeSize(viewOfSize(8, 1)));
        // 4 * 2 * 4 = 32
        assertEquals(32, ViewShot.proposeSize(viewOfSize(4, 2)));
    }

    @Test
    public void largeViewIsCappedAtThirtyTwo() {
        // 1080 * 1920 * 4 = 8,294,400 → capped at 32
        assertEquals(32, ViewShot.proposeSize(viewOfSize(1080, 1920)));
        // 100 * 100 * 4 = 40,000 → capped
        assertEquals(32, ViewShot.proposeSize(viewOfSize(100, 100)));
    }

    @Test
    public void integerOverflowFromMultiplicationDocumentedBehaviour() {
        // 65536 * 65536 * 4 overflows int to 0; min(0, 32) = 0.
        // The existing implementation does not guard against this. The
        // test pins the current behaviour so a future change to add
        // overflow handling is intentional and reviewed (rather than
        // accidental). In practice the cap of 32 makes the result
        // irrelevant at runtime — the buffer grows on first write.
        int w = 65536;
        int h = 65536;
        // Sanity: confirm the multiplication overflows in int math
        int product = w * h * 4;
        assertEquals(0, product);
        assertEquals(0, ViewShot.proposeSize(viewOfSize(w, h)));
    }
}
