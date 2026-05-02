package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.view.View;
import android.view.ViewGroup;

import java.util.List;

import org.junit.Test;

/**
 * Pure-Java + Mockito tests for {@link ViewShot#getAllChildren(View)} —
 * the leaf-collection routine used to discover {@code TextureView} and
 * {@code SurfaceView} children that need post-{@code view.draw()}
 * compositing. Contract: only leaves (non-ViewGroup nodes) are returned;
 * intermediate ViewGroups are not included; a non-ViewGroup root is
 * returned as a singleton list.
 */
public class GetAllChildrenTest {

    @Test
    public void nonViewGroupRootIsReturnedAsSingletonList() {
        View leaf = mock(View.class);

        List<View> result = ViewShot.getAllChildren(leaf);

        assertEquals(1, result.size());
        assertSame(leaf, result.get(0));
    }

    @Test
    public void emptyViewGroupReturnsEmptyList() {
        ViewGroup group = mock(ViewGroup.class);
        when(group.getChildCount()).thenReturn(0);

        List<View> result = ViewShot.getAllChildren(group);

        assertTrue("an empty ViewGroup must produce no leaves", result.isEmpty());
    }

    @Test
    public void singleChildOfViewGroupReturnedAsSingletonList() {
        ViewGroup root = mock(ViewGroup.class);
        View child = mock(View.class);
        when(root.getChildCount()).thenReturn(1);
        when(root.getChildAt(0)).thenReturn(child);

        List<View> result = ViewShot.getAllChildren(root);

        assertEquals(1, result.size());
        assertSame(child, result.get(0));
    }

    @Test
    public void multipleSiblingLeavesAreReturnedInOrder() {
        ViewGroup root = mock(ViewGroup.class);
        View a = mock(View.class);
        View b = mock(View.class);
        View c = mock(View.class);
        when(root.getChildCount()).thenReturn(3);
        when(root.getChildAt(0)).thenReturn(a);
        when(root.getChildAt(1)).thenReturn(b);
        when(root.getChildAt(2)).thenReturn(c);

        List<View> result = ViewShot.getAllChildren(root);

        assertEquals(3, result.size());
        assertSame(a, result.get(0));
        assertSame(b, result.get(1));
        assertSame(c, result.get(2));
    }

    @Test
    public void nestedViewGroupsAreFlattenedToLeavesOnly() {
        // root
        //  ├─ inner (ViewGroup)
        //  │    ├─ leafA
        //  │    └─ leafB
        //  └─ leafC
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup inner = mock(ViewGroup.class);
        View leafA = mock(View.class);
        View leafB = mock(View.class);
        View leafC = mock(View.class);

        when(root.getChildCount()).thenReturn(2);
        when(root.getChildAt(0)).thenReturn(inner);
        when(root.getChildAt(1)).thenReturn(leafC);
        when(inner.getChildCount()).thenReturn(2);
        when(inner.getChildAt(0)).thenReturn(leafA);
        when(inner.getChildAt(1)).thenReturn(leafB);

        List<View> result = ViewShot.getAllChildren(root);

        assertEquals("intermediate ViewGroups must NOT be in the result", 3, result.size());
        assertSame(leafA, result.get(0));
        assertSame(leafB, result.get(1));
        assertSame(leafC, result.get(2));
    }

    @Test
    public void deeplyNestedSingleChildChainCollectedAsOneLeaf() {
        // root → mid → inner → leaf
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup mid = mock(ViewGroup.class);
        ViewGroup inner = mock(ViewGroup.class);
        View leaf = mock(View.class);

        when(root.getChildCount()).thenReturn(1);
        when(root.getChildAt(0)).thenReturn(mid);
        when(mid.getChildCount()).thenReturn(1);
        when(mid.getChildAt(0)).thenReturn(inner);
        when(inner.getChildCount()).thenReturn(1);
        when(inner.getChildAt(0)).thenReturn(leaf);

        List<View> result = ViewShot.getAllChildren(root);

        assertEquals(1, result.size());
        assertSame(leaf, result.get(0));
    }

    @Test
    public void emptyIntermediateViewGroupContributesNoLeaves() {
        // root
        //  ├─ emptyGroup (ViewGroup, 0 children)
        //  └─ leaf
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup emptyGroup = mock(ViewGroup.class);
        View leaf = mock(View.class);

        when(root.getChildCount()).thenReturn(2);
        when(root.getChildAt(0)).thenReturn(emptyGroup);
        when(root.getChildAt(1)).thenReturn(leaf);
        when(emptyGroup.getChildCount()).thenReturn(0);

        List<View> result = ViewShot.getAllChildren(root);

        assertEquals(1, result.size());
        assertSame(leaf, result.get(0));
    }
}
