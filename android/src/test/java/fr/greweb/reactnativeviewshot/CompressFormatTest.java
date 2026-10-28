package fr.greweb.reactnativeviewshot;

import static org.junit.Assert.assertEquals;

import android.graphics.Bitmap;

import org.junit.Test;

/**
 * Pure-Java tests for {@link ViewShot#compressFormat(int, int)}.
 *
 * Unit tests run against the android.jar stubs, where
 * {@code Build.VERSION.SDK_INT} is 0, so WEBP takes the pre-API-30 branch
 * (the deprecated {@code CompressFormat.WEBP}).
 */
public class CompressFormatTest {

    @Test
    public void jpegMapsToJpeg() {
        assertEquals(Bitmap.CompressFormat.JPEG, ViewShot.compressFormat(ViewShot.Formats.JPEG, 80));
    }

    @Test
    public void pngMapsToPng() {
        assertEquals(Bitmap.CompressFormat.PNG, ViewShot.compressFormat(ViewShot.Formats.PNG, 100));
    }

    @Test
    @SuppressWarnings("deprecation")
    public void webpBelowApi30MapsToLegacyWebp() {
        assertEquals(Bitmap.CompressFormat.WEBP, ViewShot.compressFormat(ViewShot.Formats.WEBP, 100));
        assertEquals(Bitmap.CompressFormat.WEBP, ViewShot.compressFormat(ViewShot.Formats.WEBP, 80));
    }

    @Test(expected = IllegalArgumentException.class)
    public void rawIsRejected() {
        ViewShot.compressFormat(ViewShot.Formats.RAW, 100);
    }
}
