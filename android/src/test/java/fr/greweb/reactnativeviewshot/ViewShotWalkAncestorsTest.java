package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import java.util.List;

import org.junit.Test;

/**
 * Regression test for #488: walkAncestors must not throw NPE or
 * ClassCastException when:
 *   - child == root (captured view is itself a non-ViewGroup),
 *   - parent chain ends in null mid-walk,
 *   - parent chain reaches a non-View ViewParent (e.g. ViewRootImpl).
 *
 * Real Android view hierarchies have ViewGroup parents (which implement
 * both View and ViewParent), so mocks here use ViewGroup for any node
 * that needs to act as a parent.
 */
public class ViewShotWalkAncestorsTest {

    @Test
    public void returnsEmptyWhenChildEqualsRoot() {
        View root = mock(View.class);
        List<View> result = ViewShot.walkAncestors(root, root);
        assertTrue("expected no ancestors when child == root", result.isEmpty());
    }

    @Test
    public void stopsAtNullParent() {
        View root = mock(View.class);
        View child = mock(View.class);
        when(child.getParent()).thenReturn(null);

        List<View> result = ViewShot.walkAncestors(child, root);

        assertEquals(1, result.size());
        assertEquals(child, result.get(0));
    }

    @Test
    public void stopsAtNonViewParent() {
        View root = mock(View.class);
        View child = mock(View.class);
        // ViewRootImpl is a ViewParent but not a View; walking past root
        // would hit it. Walk must stop without ClassCastException.
        ViewParent nonView = mock(ViewParent.class);
        when(child.getParent()).thenReturn(nonView);

        List<View> result = ViewShot.walkAncestors(child, root);

        assertEquals(1, result.size());
        assertEquals(child, result.get(0));
    }

    @Test
    public void walksUpToButNotIncludingRoot() {
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup parent = mock(ViewGroup.class);
        View child = mock(View.class);
        when(child.getParent()).thenReturn(parent);
        when(parent.getParent()).thenReturn(root);

        List<View> result = ViewShot.walkAncestors(child, root);

        assertEquals(2, result.size());
        assertEquals(child, result.get(0));
        assertEquals(parent, result.get(1));
    }

    @Test
    public void walksDeepChainTerminatedByRoot() {
        ViewGroup root = mock(ViewGroup.class);
        ViewGroup g1 = mock(ViewGroup.class);
        ViewGroup g2 = mock(ViewGroup.class);
        ViewGroup g3 = mock(ViewGroup.class);
        View child = mock(View.class);
        when(child.getParent()).thenReturn(g3);
        when(g3.getParent()).thenReturn(g2);
        when(g2.getParent()).thenReturn(g1);
        when(g1.getParent()).thenReturn(root);

        List<View> result = ViewShot.walkAncestors(child, root);

        assertEquals(4, result.size());
        assertEquals(child, result.get(0));
        assertEquals(g3, result.get(1));
        assertEquals(g2, result.get(2));
        assertEquals(g1, result.get(3));
    }
}
