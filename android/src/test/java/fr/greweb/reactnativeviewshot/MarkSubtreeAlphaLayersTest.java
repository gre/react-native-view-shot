package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.view.View;
import android.view.ViewGroup;

import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

/**
 * Pure-Java + Mockito tests for
 * {@link ViewShot#markSubtreeAlphaLayers(View, List)} — verifies the
 * narrow conditions under which a translucent ViewGroup is forced to
 * {@code LAYER_TYPE_SOFTWARE} for capture, plus subtree recursion.
 *
 * The four ANDed conditions for marking are:
 *   1. 0 < alpha < 1
 *   2. childCount > 1
 *   3. hasOverlappingRendering()
 *   4. getLayerType() == LAYER_TYPE_NONE
 *
 * When all hold the view is added to the {@code tracked} list and its
 * layer type is flipped to LAYER_TYPE_SOFTWARE. Recursion always
 * descends into children regardless of the parent's mark eligibility.
 */
public class MarkSubtreeAlphaLayersTest {

    /** Helper: a ViewGroup pre-stubbed for the eligibility predicate. */
    private static ViewGroup eligibleGroup(int childCount) {
        ViewGroup g = mock(ViewGroup.class);
        when(g.getAlpha()).thenReturn(0.5f);
        when(g.getChildCount()).thenReturn(childCount);
        when(g.hasOverlappingRendering()).thenReturn(true);
        when(g.getLayerType()).thenReturn(View.LAYER_TYPE_NONE);
        return g;
    }

    // ---- Non-eligibility short-circuits ----

    @Test
    public void plainViewIsIgnored() {
        View leaf = mock(View.class);
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(leaf, tracked);

        assertTrue("non-ViewGroup must never be tracked", tracked.isEmpty());
        verify(leaf, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void fullyOpaqueGroupIsNotMarked() {
        ViewGroup g = eligibleGroup(2);
        when(g.getAlpha()).thenReturn(1.0f);
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void fullyTransparentGroupIsNotMarked() {
        // alpha == 0 → still falls outside (0,1), not marked
        ViewGroup g = eligibleGroup(2);
        when(g.getAlpha()).thenReturn(0.0f);
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void singleChildGroupIsNotMarked() {
        // childCount == 1 → bug doesn't manifest, no layer needed
        ViewGroup g = eligibleGroup(1);
        // need at least one stubbed child for the recursion loop
        View only = mock(View.class);
        when(g.getChildAt(0)).thenReturn(only);
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void zeroChildGroupIsNotMarked() {
        ViewGroup g = eligibleGroup(0);
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void groupWithoutOverlappingRenderingIsNotMarked() {
        ViewGroup g = eligibleGroup(2);
        when(g.hasOverlappingRendering()).thenReturn(false);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void groupWithExistingNonNoneLayerTypeIsNotMarked() {
        ViewGroup g = eligibleGroup(2);
        when(g.getLayerType()).thenReturn(View.LAYER_TYPE_HARDWARE);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue("HARDWARE layer must not be flipped (would lose paint)", tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    @Test
    public void groupWithSoftwareLayerTypeIsNotReMarked() {
        ViewGroup g = eligibleGroup(2);
        when(g.getLayerType()).thenReturn(View.LAYER_TYPE_SOFTWARE);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertTrue(tracked.isEmpty());
        verify(g, never()).setLayerType(anyInt(), any());
    }

    // ---- Eligibility happy path ----

    @Test
    public void eligibleGroupIsTrackedAndFlippedToSoftware() {
        ViewGroup g = eligibleGroup(2);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertEquals(1, tracked.size());
        assertSame(g, tracked.get(0));
        verify(g, times(1)).setLayerType(View.LAYER_TYPE_SOFTWARE, null);
    }

    @Test
    public void alphaJustAboveZeroIsEligible() {
        ViewGroup g = eligibleGroup(2);
        when(g.getAlpha()).thenReturn(0.0001f);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertEquals(1, tracked.size());
    }

    @Test
    public void alphaJustBelowOneIsEligible() {
        ViewGroup g = eligibleGroup(2);
        when(g.getAlpha()).thenReturn(0.9999f);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));
        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertEquals(1, tracked.size());
    }

    // ---- Recursion ----

    @Test
    public void recursesIntoEveryChildEvenWhenParentNotMarked() {
        // root is opaque (childCount=2 but alpha=1), so root is NOT marked.
        // But its eligible nested child IS.
        ViewGroup root = mock(ViewGroup.class);
        when(root.getAlpha()).thenReturn(1.0f);
        when(root.getChildCount()).thenReturn(2);
        when(root.hasOverlappingRendering()).thenReturn(true);
        when(root.getLayerType()).thenReturn(View.LAYER_TYPE_NONE);

        ViewGroup eligibleChild = eligibleGroup(2);
        when(eligibleChild.getChildAt(0)).thenReturn(mock(View.class));
        when(eligibleChild.getChildAt(1)).thenReturn(mock(View.class));
        View plainChild = mock(View.class);

        when(root.getChildAt(0)).thenReturn(eligibleChild);
        when(root.getChildAt(1)).thenReturn(plainChild);

        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(root, tracked);

        assertEquals(1, tracked.size());
        assertSame(eligibleChild, tracked.get(0));
        verify(root, never()).setLayerType(anyInt(), any());
        verify(eligibleChild, times(1)).setLayerType(View.LAYER_TYPE_SOFTWARE, null);
    }

    @Test
    public void marksMultipleEligibleNodesInTree() {
        // Both root and inner are eligible — both get tracked & flipped.
        ViewGroup root = eligibleGroup(2);
        ViewGroup inner = eligibleGroup(2);
        View leafA = mock(View.class);
        View leafB = mock(View.class);
        View leafC = mock(View.class);

        when(root.getChildAt(0)).thenReturn(inner);
        when(root.getChildAt(1)).thenReturn(leafC);
        when(inner.getChildAt(0)).thenReturn(leafA);
        when(inner.getChildAt(1)).thenReturn(leafB);

        List<View> tracked = new ArrayList<>();

        ViewShot.markSubtreeAlphaLayers(root, tracked);

        assertEquals(2, tracked.size());
        assertTrue(tracked.contains(root));
        assertTrue(tracked.contains(inner));
        verify(root, times(1)).setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        verify(inner, times(1)).setLayerType(View.LAYER_TYPE_SOFTWARE, null);
    }

    @Test
    public void emptyTrackedListIsAcceptedAsInput() {
        // Sanity: passing an empty list doesn't blow up, and the list
        // is mutated in place.
        ViewGroup g = eligibleGroup(2);
        when(g.getChildAt(0)).thenReturn(mock(View.class));
        when(g.getChildAt(1)).thenReturn(mock(View.class));

        List<View> tracked = new ArrayList<>();
        assertTrue(tracked.isEmpty());

        ViewShot.markSubtreeAlphaLayers(g, tracked);

        assertFalse(tracked.isEmpty());
    }

    // ---- Mockito helpers ----
    // Local wrappers around Mockito ArgumentMatchers.any() / anyInt()
    // implemented via fully-qualified calls to keep the static-import
    // block at the top focused on org.junit.Assert / Mockito.* and avoid
    // import-order churn.
    private static int anyInt() {
        return org.mockito.ArgumentMatchers.anyInt();
    }
    private static <T> T any() {
        return org.mockito.ArgumentMatchers.<T>any();
    }
}
