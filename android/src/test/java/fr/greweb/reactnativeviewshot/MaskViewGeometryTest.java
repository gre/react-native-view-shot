package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.RectF;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.facebook.react.uimanager.ReactOverflowView;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.annotation.GraphicsMode;

/**
 * Geometry of masks (and TextureView/SurfaceView compositing), checked on real
 * views and matrices. {@link #assertDrawnAt} also draws the tree, so the
 * expected coordinates are the ones Android itself uses.
 */
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34, manifest = Config.NONE)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
public class MaskViewGeometryTest {

    private static final float EPSILON = 0.01f;

    private Context context;
    private FrameLayout root;

    /** Like ReactViewGroup: clipChildren is off and `overflow` decides. */
    private static class OverflowView extends FrameLayout implements ReactOverflowView {
        private final String overflow;

        OverflowView(Context context, String overflow) {
            super(context);
            this.overflow = overflow;
            setClipChildren(false);
        }

        @Override
        public String getOverflow() {
            return overflow;
        }
    }

    @Before
    public void setUp() {
        context = RuntimeEnvironment.getApplication();
        root = group();
        root.layout(0, 0, 500, 500);
    }

    private FrameLayout group() {
        FrameLayout view = new FrameLayout(context);
        view.setClipChildren(false);
        return view;
    }

    private static <T extends View> T add(ViewGroup parent, T view, int x, int y, int w, int h) {
        parent.addView(view);
        view.layout(x, y, x + w, y + h);
        return view;
    }

    private View mask(ViewGroup parent, int x, int y, int w, int h) {
        View view = add(parent, new View(context), x, y, w, h);
        view.setBackgroundColor(Color.RED);
        return view;
    }

    private static void assertRect(RectF rect, float l, float t, float r, float b) {
        assertEquals("left", l, rect.left, EPSILON);
        assertEquals("top", t, rect.top, EPSILON);
        assertEquals("right", r, rect.right, EPSILON);
        assertEquals("bottom", b, rect.bottom, EPSILON);
    }

    private RectF drawnBounds() {
        Bitmap bitmap = Bitmap.createBitmap(500, 500, Bitmap.Config.ARGB_8888);
        root.draw(new Canvas(bitmap));
        RectF bounds = new RectF();
        for (int y = 0; y < 500; y++) {
            for (int x = 0; x < 500; x++) {
                if (bitmap.getPixel(x, y) == Color.RED) bounds.union(x, y, x + 1, y + 1);
            }
        }
        return bounds;
    }

    private void assertDrawnAt(View child, float l, float t, float r, float b) {
        RectF mapped = new RectF(0, 0, child.getWidth(), child.getHeight());
        ViewShot.computeRelativeTransform(child, root).mapRect(mapped);
        assertRect(drawnBounds(), l, t, r, b);
        assertRect(mapped, l, t, r, b);
    }

    @Test
    public void transform_rootIsIdentity() {
        assertTrue(ViewShot.computeRelativeTransform(root, root).isIdentity());
    }

    @Test
    public void transform_nestedOffsets() {
        FrameLayout parent = add(root, group(), 50, 60, 200, 200);
        assertDrawnAt(mask(parent, 15, 25, 40, 40), 65, 85, 105, 125);
    }

    @Test
    public void transform_scaledMask() {
        View child = mask(root, 50, 50, 40, 40);
        child.setPivotX(20);
        child.setPivotY(20);
        child.setScaleX(2);
        child.setScaleY(2);
        assertDrawnAt(child, 30, 30, 110, 110);
    }

    @Test
    public void transform_scaledParent() {
        FrameLayout parent = add(root, group(), 0, 0, 200, 200);
        parent.setPivotX(100);
        parent.setPivotY(100);
        parent.setScaleX(0.5f);
        parent.setScaleY(0.5f);
        assertDrawnAt(mask(parent, 100, 100, 40, 40), 100, 100, 120, 120);
    }

    @Test
    public void transform_rotatedParent() {
        FrameLayout parent = add(root, group(), 100, 100, 200, 200);
        parent.setPivotX(100);
        parent.setPivotY(100);
        parent.setRotation(90);
        View child = mask(parent, 20, 0, 40, 20);

        assertDrawnAt(child, 280, 120, 300, 160);
        // The bounds alone don't tell which corner is which.
        float[] topLeft = {0, 0};
        ViewShot.computeRelativeTransform(child, root).mapPoints(topLeft);
        assertEquals(300, topLeft[0], EPSILON);
        assertEquals(120, topLeft[1], EPSILON);
    }

    @Test
    public void transform_scaledParentAndTranslatedMask() {
        FrameLayout parent = add(root, group(), 40, 40, 200, 200);
        parent.setPivotX(0);
        parent.setPivotY(0);
        parent.setScaleX(2);
        parent.setScaleY(2);
        View child = mask(parent, 10, 10, 40, 40);
        child.setTranslationX(5);
        assertDrawnAt(child, 70, 60, 150, 140);
    }

    @Test
    public void transform_subtractsIntermediateScroll() {
        FrameLayout scroller = add(root, group(), 20, 20, 200, 200);
        scroller.scrollTo(10, 30);
        assertDrawnAt(mask(scroller, 50, 100, 40, 40), 60, 90, 100, 130);
    }

    @Test
    public void transform_ignoresTheScrollOfTheRoot() {
        root.scrollTo(15, 25);
        assertDrawnAt(mask(root, 100, 200, 40, 40), 100, 200, 140, 240);
    }

    @Test
    public void clip_overflowHiddenAndScrollClip() {
        for (String overflow : new String[] {"hidden", "scroll"}) {
            OverflowView parent = add(root, new OverflowView(context, overflow), 20, 30, 100, 100);
            View child = mask(parent, 80, 80, 100, 100);
            assertRect(ViewShot.computeAncestorClipRect(child, root), 20, 30, 120, 130);
        }
    }

    @Test
    public void clip_overflowVisibleDoesNotClip() {
        for (String overflow : new String[] {"visible", null}) {
            OverflowView parent = add(root, new OverflowView(context, overflow), 20, 30, 100, 100);
            View child = mask(parent, 80, 80, 100, 100);
            assertRect(ViewShot.computeAncestorClipRect(child, root), 0, 0, 500, 500);
        }
    }

    @Test
    public void clip_intersectsNestedClips() {
        OverflowView outer = add(root, new OverflowView(context, "hidden"), 0, 0, 100, 100);
        OverflowView inner = add(outer, new OverflowView(context, "hidden"), 50, 50, 100, 100);
        View child = mask(inner, 0, 0, 100, 100);
        assertRect(ViewShot.computeAncestorClipRect(child, root), 50, 50, 100, 100);
    }

    @Test
    public void clip_scrolledOutOfViewIsEmpty() {
        OverflowView outer = add(root, new OverflowView(context, "hidden"), 0, 0, 100, 100);
        OverflowView inner = add(outer, new OverflowView(context, "hidden"), 0, 200, 100, 100);
        View child = mask(inner, 0, 0, 100, 100);
        assertTrue(ViewShot.computeAncestorClipRect(child, root).isEmpty());
    }

    @Test
    public void clip_usesTheTransformOfTheClippingAncestor() {
        OverflowView parent = add(root, new OverflowView(context, "hidden"), 100, 100, 100, 100);
        parent.setPivotX(50);
        parent.setPivotY(50);
        parent.setScaleX(2);
        parent.setScaleY(2);
        View child = mask(parent, 0, 0, 100, 100);
        assertRect(ViewShot.computeAncestorClipRect(child, root), 50, 50, 250, 250);
    }

    /**
     * clipChildren clips each child to the child's own bounds. The content of a
     * view overflowing its clipChildren parent is drawn, so it must be masked.
     */
    @Test
    public void clip_clipChildrenDoesNotClipToTheParentItself() {
        FrameLayout parent = add(root, group(), 20, 20, 50, 50);
        parent.setClipChildren(true);
        View child = mask(parent, 30, 30, 100, 100);

        assertRect(drawnBounds(), 50, 50, 150, 150);
        assertRect(ViewShot.computeAncestorClipRect(child, root), 0, 0, 500, 500);
    }

    @Test
    public void clip_clipChildrenClipsTheChildrenOfTheGroup() {
        root.setClipChildren(true);
        FrameLayout parent = add(root, group(), 20, 20, 50, 50);
        View child = mask(parent, 30, 30, 100, 100);

        assertRect(drawnBounds(), 50, 50, 70, 70);
        assertRect(ViewShot.computeAncestorClipRect(child, root), 20, 20, 70, 70);
    }
}
