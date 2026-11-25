package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyFloat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedConstruction;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Tests for MaskView support routines in {@link ViewShot}:
 * - {@link ViewShot#parseMaskColor(String)} hex parsing and fallback without Color.parseColor
 * - {@link ViewShot#getAllChildren(View, Set)} pruning masked subtrees
 * - {@link ViewShot#isDescendantOfAny(View, Set)} hierarchy checking
 * - {@link ViewShot#collectMaskViews(View, View, List, Set)} collection and pruning
 * - {@link ViewShot#drawMasks(Canvas, List)} canvas painting with clipping
 *
 * Transforms and clipping are covered by {@link MaskViewGeometryTest}.
 */
public class MaskViewCollectionTest {

    private MockedConstruction<Matrix> matrixConstruction;

    @Before
    public void setUp() {
        matrixConstruction = mockConstruction(Matrix.class);
    }

    @After
    public void tearDown() {
        if (matrixConstruction != null) {
            matrixConstruction.close();
        }
    }

    @Test
    public void parseMaskColor_handlesHexIntegersTransparentAndFallback() {
        // Black (opaque 0xFF000000)
        assertEquals(0xFF000000, ViewShot.parseMaskColor("rn-view-shot-mask:ff000000"));

        // Red (opaque 0xFFFF0000)
        assertEquals(0xFFFF0000, ViewShot.parseMaskColor("rn-view-shot-mask:ffff0000"));

        // Blue (#00F -> 0xFF0000FF)
        assertEquals(0xFF0000FF, ViewShot.parseMaskColor("rn-view-shot-mask:ff0000ff"));

        // Green with alpha (#00800080 -> 0x80008000)
        assertEquals((int) 0x80008000L, ViewShot.parseMaskColor("rn-view-shot-mask:80008000"));

        // Orange with 0.5 alpha (rgba(255, 165, 0, 0.5) -> 0x80FFA500)
        assertEquals((int) 0x80FFA500L, ViewShot.parseMaskColor("rn-view-shot-mask:80ffa500"));

        // Transparent (0x00000000)
        assertEquals(0x00000000, ViewShot.parseMaskColor("rn-view-shot-mask:00000000"));

        // Semi-transparent ARGB
        assertEquals((int) Long.parseLong("80ff5500", 16), ViewShot.parseMaskColor("rn-view-shot-mask:80ff5500"));

        // Fallback for empty / invalid
        assertEquals(Color.BLACK, ViewShot.parseMaskColor("rn-view-shot-mask:invalid"));
        assertEquals(Color.BLACK, ViewShot.parseMaskColor("rn-view-shot-mask:"));
    }

    @Test
    public void getAllChildren_prunesMaskedSubtree() {
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup maskView = mock(ViewGroup.class);
        TextureView innerTexture = mock(TextureView.class);
        TextureView outerTexture = mock(TextureView.class);

        when(root.getChildCount()).thenReturn(2);
        when(root.getChildAt(0)).thenReturn(maskView);
        when(root.getChildAt(1)).thenReturn(outerTexture);

        when(maskView.getChildCount()).thenReturn(1);
        when(maskView.getChildAt(0)).thenReturn(innerTexture);

        Set<View> maskedNodes = new HashSet<>();
        maskedNodes.add(maskView);

        List<View> children = ViewShot.getAllChildren(root, maskedNodes);

        // innerTexture is inside maskView and must be pruned; only outerTexture is returned
        assertEquals(1, children.size());
        assertEquals(outerTexture, children.get(0));
    }

    @Test
    public void isDescendantOfAny_correctlyIdentifiesAncestry() {
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup maskParent = mock(ViewGroup.class);
        when(maskParent.getParent()).thenReturn(root);

        View child = mock(View.class);
        when(child.getParent()).thenReturn(maskParent);

        View sibling = mock(View.class);
        when(sibling.getParent()).thenReturn(root);

        Set<View> maskedNodes = new HashSet<>();
        maskedNodes.add(maskParent);

        assertTrue(ViewShot.isDescendantOfAny(child, maskedNodes));
        assertFalse(ViewShot.isDescendantOfAny(sibling, maskedNodes));
        assertFalse(ViewShot.isDescendantOfAny(root, maskedNodes));
        assertFalse(ViewShot.isDescendantOfAny(child, Collections.emptySet()));
    }

    @Test
    public void collectMaskViews_prunesRecursionOnMaskNode() {
        ViewGroup root = mock(ViewGroup.class);
        when(root.getVisibility()).thenReturn(View.VISIBLE);
        when(root.getAlpha()).thenReturn(1.0f);
        when(root.getWidth()).thenReturn(500);
        when(root.getHeight()).thenReturn(500);

        ViewGroup maskView = mock(ViewGroup.class);
        when(maskView.getVisibility()).thenReturn(View.VISIBLE);
        when(maskView.getAlpha()).thenReturn(1.0f);
        when(maskView.getWidth()).thenReturn(100);
        when(maskView.getHeight()).thenReturn(50);
        when(maskView.getParent()).thenReturn(root);
        when(maskView.getTag(com.facebook.react.R.id.view_tag_native_id))
            .thenReturn(ViewShot.MASK_TAG_PREFIX + "ffff0000");

        Matrix identity = mock(Matrix.class);
        when(identity.isIdentity()).thenReturn(true);
        when(maskView.getMatrix()).thenReturn(identity);

        ViewGroup nestedMaskView = mock(ViewGroup.class);
        when(nestedMaskView.getVisibility()).thenReturn(View.VISIBLE);
        when(nestedMaskView.getAlpha()).thenReturn(1.0f);
        when(nestedMaskView.getWidth()).thenReturn(40);
        when(nestedMaskView.getHeight()).thenReturn(20);
        when(nestedMaskView.getParent()).thenReturn(maskView);
        when(nestedMaskView.getTag(com.facebook.react.R.id.view_tag_native_id))
            .thenReturn(ViewShot.MASK_TAG_PREFIX + "ff00ff00");

        when(maskView.getChildCount()).thenReturn(1);
        when(maskView.getChildAt(0)).thenReturn(nestedMaskView);

        when(root.getChildCount()).thenReturn(1);
        when(root.getChildAt(0)).thenReturn(maskView);

        List<ViewShot.MaskInfo> masks = new ArrayList<>();
        Set<View> maskedNodes = new HashSet<>();

        ViewShot.collectMaskViews(root, root, masks, maskedNodes);

        // Only the outer maskView should be collected; recursion into nestedMaskView is pruned
        assertEquals(1, masks.size());
        assertEquals(100, masks.get(0).width);
        assertEquals(50, masks.get(0).height);
        assertTrue(maskedNodes.contains(maskView));
        assertFalse(maskedNodes.contains(nestedMaskView));
        verify(maskView, never()).getChildAt(any(int.class));
    }

    @Test
    public void collectMaskViews_skipsZeroSizeViewFromMaskListButMarksNode() {
        ViewGroup root = mock(ViewGroup.class);
        when(root.getVisibility()).thenReturn(View.VISIBLE);
        when(root.getAlpha()).thenReturn(1.0f);

        View zeroSizeMask = mock(View.class);
        when(zeroSizeMask.getVisibility()).thenReturn(View.VISIBLE);
        when(zeroSizeMask.getAlpha()).thenReturn(1.0f);
        when(zeroSizeMask.getWidth()).thenReturn(0);
        when(zeroSizeMask.getHeight()).thenReturn(0);
        when(zeroSizeMask.getParent()).thenReturn(root);
        when(zeroSizeMask.getTag(com.facebook.react.R.id.view_tag_native_id))
            .thenReturn(ViewShot.MASK_TAG_PREFIX + "ff000000");

        when(root.getChildCount()).thenReturn(1);
        when(root.getChildAt(0)).thenReturn(zeroSizeMask);

        List<ViewShot.MaskInfo> masks = new ArrayList<>();
        Set<View> maskedNodes = new HashSet<>();

        ViewShot.collectMaskViews(root, root, masks, maskedNodes);

        // Zero-sized mask view is marked as a masked node (to suppress children) but produces no draw rect
        assertTrue(masks.isEmpty());
        assertTrue(maskedNodes.contains(zeroSizeMask));
    }

    @Test
    public void drawMasks_paintsMaskRectanglesOntoCanvasWithClipping() {
        Canvas mockCanvas = mock(Canvas.class);
        when(mockCanvas.save()).thenReturn(1);

        Matrix matrix = mock(Matrix.class);
        RectF clipRect = mock(RectF.class);
        ViewShot.MaskInfo mask = new ViewShot.MaskInfo(Color.RED, matrix, 200, 100, clipRect);
        List<ViewShot.MaskInfo> masks = Collections.singletonList(mask);

        ViewShot.drawMasks(mockCanvas, masks);

        verify(mockCanvas).save();
        verify(mockCanvas).clipRect(clipRect);
        verify(mockCanvas).concat(matrix);
        verify(mockCanvas).drawRect(eq(0f), eq(0f), eq(200f), eq(100f), any(Paint.class));
        verify(mockCanvas).restoreToCount(1);
    }

    @Test
    public void drawMasks_skipsMaskWhenClipRectIsEmpty() {
        Canvas mockCanvas = mock(Canvas.class);
        Matrix matrix = mock(Matrix.class);
        RectF clipRect = mock(RectF.class);
        when(clipRect.isEmpty()).thenReturn(true);
        ViewShot.MaskInfo mask = new ViewShot.MaskInfo(Color.RED, matrix, 200, 100, clipRect);
        List<ViewShot.MaskInfo> masks = Collections.singletonList(mask);

        ViewShot.drawMasks(mockCanvas, masks);

        verify(mockCanvas, never()).save();
        verify(mockCanvas, never()).concat(any(Matrix.class));
        verify(mockCanvas, never()).drawRect(anyFloat(), anyFloat(), anyFloat(), anyFloat(), any(Paint.class));
    }
}
