package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

import org.junit.Test;

/**
 * Tests pinning the contract of the
 * {@code STATE_QUEUED / STATE_RUNNING / STATE_DONE} state machine and
 * the {@link ViewShot.UiThreadBlockTimeoutException}. The CAS protocol
 * in {@code runOnUiThreadBlocking} relies only on equality (via
 * {@code compareAndSet}), so these tests assert the three states are
 * pairwise distinct so the CAS protocol can distinguish them — nothing
 * more. Numeric values and ordering are deliberately not pinned.
 *
 * Constants are private; we read them via reflection rather than
 * widening their visibility.
 */
public class ViewShotStateMachineTest {

    private static int readPrivateStaticInt(String name) throws Exception {
        Field f = ViewShot.class.getDeclaredField(name);
        f.setAccessible(true);
        assertTrue("expected static field: " + name, Modifier.isStatic(f.getModifiers()));
        assertTrue("expected final field: " + name, Modifier.isFinal(f.getModifiers()));
        return f.getInt(null);
    }

    @Test
    public void stateConstantsAreDistinct() throws Exception {
        int queued = readPrivateStaticInt("STATE_QUEUED");
        int running = readPrivateStaticInt("STATE_RUNNING");
        int done = readPrivateStaticInt("STATE_DONE");

        assertNotEquals("QUEUED == RUNNING would break CAS", queued, running);
        assertNotEquals("RUNNING == DONE would break CAS", running, done);
        assertNotEquals("QUEUED == DONE would break CAS", queued, done);
    }

    // ---- UiThreadBlockTimeoutException ----

    @Test
    public void uiThreadBlockTimeoutExceptionIsRuntimeException() {
        ViewShot.UiThreadBlockTimeoutException e =
                new ViewShot.UiThreadBlockTimeoutException("hello");

        assertTrue("must extend RuntimeException so it propagates without checked-throws",
                e instanceof RuntimeException);
    }

    @Test
    public void uiThreadBlockTimeoutExceptionMessageRoundTrips() {
        ViewShot.UiThreadBlockTimeoutException e =
                new ViewShot.UiThreadBlockTimeoutException("Timed out waiting for UI thread after 5s");

        assertEquals("Timed out waiting for UI thread after 5s", e.getMessage());
    }

    @Test
    public void uiThreadBlockTimeoutExceptionAcceptsNullMessage() {
        ViewShot.UiThreadBlockTimeoutException e =
                new ViewShot.UiThreadBlockTimeoutException(null);

        assertNull(e.getMessage());
    }

    @Test
    public void uiThreadBlockTimeoutExceptionAcceptsEmptyMessage() {
        ViewShot.UiThreadBlockTimeoutException e =
                new ViewShot.UiThreadBlockTimeoutException("");

        assertNotNull(e.getMessage());
        assertEquals("", e.getMessage());
    }

    @Test
    public void uiThreadBlockTimeoutExceptionCanBeThrownAndCaughtAsItself() {
        try {
            throw new ViewShot.UiThreadBlockTimeoutException("boom");
        } catch (ViewShot.UiThreadBlockTimeoutException caught) {
            assertEquals("boom", caught.getMessage());
        }
    }

    @Test
    public void uiThreadBlockTimeoutExceptionCanBeCaughtAsRuntimeException() {
        try {
            throw new ViewShot.UiThreadBlockTimeoutException("boom");
        } catch (RuntimeException caught) {
            assertSame(ViewShot.UiThreadBlockTimeoutException.class, caught.getClass());
        }
    }
}
