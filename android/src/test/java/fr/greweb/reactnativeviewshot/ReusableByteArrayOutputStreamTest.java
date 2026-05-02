package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.nio.ByteBuffer;

import org.junit.Test;

import fr.greweb.reactnativeviewshot.ViewShot.ReusableByteArrayOutputStream;

/**
 * Pure-Java tests for {@link ReusableByteArrayOutputStream} — exercises
 * the buffer-grow path, capacity edge cases, and the {@code asBuffer}
 * lazy-grow contract used by RAW captures.
 *
 * MAX_ARRAY_SIZE is private but mirrors {@code Integer.MAX_VALUE - 8}
 * (matching the JDK convention). Tests reference that literal directly.
 */
public class ReusableByteArrayOutputStreamTest {

    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    /** Test subclass that exposes the protected grow() to assertions. */
    private static class TestStream extends ReusableByteArrayOutputStream {
        TestStream(byte[] buffer) {
            super(buffer);
        }
        void callGrow(int minCapacity) {
            grow(minCapacity);
        }
    }

    // ---- innerBuffer / setSize / constructor ----

    @Test
    public void innerBufferReturnsSameInstanceAsConstructor() {
        byte[] buffer = new byte[16];
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(buffer);
        assertSame("inner buffer must be the exact instance passed in", buffer, s.innerBuffer());
    }

    @Test
    public void setSizeUpdatesCountWithoutResizingBuffer() {
        byte[] buffer = new byte[16];
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(buffer);

        s.setSize(7);
        assertEquals(7, s.size());
        // setSize must not resize the underlying buffer
        assertSame(buffer, s.innerBuffer());

        s.setSize(0);
        assertEquals(0, s.size());
    }

    @Test
    public void setSizeAcceptsValueLargerThanBufferLengthWithoutThrowing() {
        // setSize is purely a count mutation — it does not (and is not
        // expected to) validate against the buffer length. Documenting
        // that contract: the caller is responsible for ensuring the
        // buffer is large enough before reading 'size' bytes back.
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(new byte[4]);
        s.setSize(99);
        assertEquals(99, s.size());
    }

    // ---- asBuffer ----

    @Test
    public void asBufferReturnsByteBufferWrappingInnerBufferWhenLargeEnough() {
        byte[] buffer = new byte[32];
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(buffer);

        ByteBuffer bb = s.asBuffer(16);

        assertNotNull(bb);
        // ByteBuffer.wrap exposes the same backing array
        assertTrue("byte buffer should expose the inner array", bb.hasArray());
        assertSame(buffer, bb.array());
        // No grow happened
        assertSame(buffer, s.innerBuffer());
        assertEquals(buffer.length, bb.capacity());
    }

    @Test
    public void asBufferGrowsBufferWhenRequestedSizeExceedsCurrentCapacity() {
        byte[] buffer = new byte[8];
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(buffer);

        ByteBuffer bb = s.asBuffer(64);

        assertTrue("capacity should have grown to at least 64", bb.capacity() >= 64);
        assertTrue("inner buffer should reflect the grown size",
                s.innerBuffer().length >= 64);
        // grow doubles first; if doubling is enough we keep that, else use minCapacity.
        // 8 << 1 = 16 < 64, so newCapacity = 64.
        assertEquals(64, s.innerBuffer().length);
    }

    @Test
    public void asBufferIsNoOpWhenRequestedSizeEqualsCurrentLength() {
        byte[] buffer = new byte[16];
        ReusableByteArrayOutputStream s = new ReusableByteArrayOutputStream(buffer);

        ByteBuffer bb = s.asBuffer(16);

        // 16 < 16 is false → no grow
        assertSame(buffer, s.innerBuffer());
        assertEquals(16, bb.capacity());
    }

    // ---- grow ----

    @Test
    public void growDoublesCapacityWhenDoublingSatisfiesMinCapacity() {
        TestStream s = new TestStream(new byte[16]);

        s.callGrow(20); // 16 << 1 = 32, 32 >= 20 → use 32

        assertEquals(32, s.innerBuffer().length);
    }

    @Test
    public void growUsesMinCapacityWhenDoublingIsTooSmall() {
        TestStream s = new TestStream(new byte[8]);

        s.callGrow(100); // 8 << 1 = 16 < 100 → use 100

        assertEquals(100, s.innerBuffer().length);
    }

    @Test
    public void growPreservesExistingBufferContents() {
        byte[] initial = new byte[]{1, 2, 3, 4};
        TestStream s = new TestStream(initial);

        s.callGrow(64);

        byte[] grown = s.innerBuffer();
        assertEquals(64, grown.length);
        assertEquals(1, grown[0]);
        assertEquals(2, grown[1]);
        assertEquals(3, grown[2]);
        assertEquals(4, grown[3]);
        assertEquals(0, grown[4]);
    }

    @Test
    public void growHandlesMinCapacityEqualToZero() {
        // Edge case: minCapacity == 0. oldCapacity (4) << 1 == 8, and
        // 8 - 0 < 0 is false, so newCapacity stays at 8. Verifies the
        // doubling branch doesn't accidentally shrink to minCapacity.
        TestStream s = new TestStream(new byte[4]);

        s.callGrow(0);

        assertEquals(8, s.innerBuffer().length);
    }

    @Test
    public void growHandlesSmallStartingBuffer() {
        // 1-byte buffer, doubling to 2 satisfies minCapacity=2.
        TestStream s = new TestStream(new byte[1]);

        s.callGrow(2);

        assertEquals(2, s.innerBuffer().length);
    }

    // ---- hugeCapacity ----

    @Test
    public void hugeCapacityThrowsOnNegativeMinCapacity() {
        try {
            ReusableByteArrayOutputStream.hugeCapacity(-1);
            fail("expected OutOfMemoryError on negative input");
        } catch (OutOfMemoryError expected) {
            // expected
        }
    }

    @Test
    public void hugeCapacityThrowsOnIntegerMinValueOverflow() {
        try {
            ReusableByteArrayOutputStream.hugeCapacity(Integer.MIN_VALUE);
            fail("expected OutOfMemoryError on Integer.MIN_VALUE");
        } catch (OutOfMemoryError expected) {
            // expected
        }
    }

    @Test
    public void hugeCapacityReturnsMaxArraySizeForExactBoundary() {
        // minCapacity == MAX_ARRAY_SIZE → not greater than → returns MAX_ARRAY_SIZE
        assertEquals(MAX_ARRAY_SIZE,
                ReusableByteArrayOutputStream.hugeCapacity(MAX_ARRAY_SIZE));
    }

    @Test
    public void hugeCapacityReturnsMaxArraySizeWhenMinCapacityFitsBelowBoundary() {
        assertEquals(MAX_ARRAY_SIZE,
                ReusableByteArrayOutputStream.hugeCapacity(MAX_ARRAY_SIZE - 1));
        assertEquals(MAX_ARRAY_SIZE,
                ReusableByteArrayOutputStream.hugeCapacity(0));
        assertEquals(MAX_ARRAY_SIZE,
                ReusableByteArrayOutputStream.hugeCapacity(1));
    }

    @Test
    public void hugeCapacityReturnsIntegerMaxValueWhenMinCapacityExceedsMaxArraySize() {
        assertEquals(Integer.MAX_VALUE,
                ReusableByteArrayOutputStream.hugeCapacity(MAX_ARRAY_SIZE + 1));
        assertEquals(Integer.MAX_VALUE,
                ReusableByteArrayOutputStream.hugeCapacity(Integer.MAX_VALUE));
    }
}
