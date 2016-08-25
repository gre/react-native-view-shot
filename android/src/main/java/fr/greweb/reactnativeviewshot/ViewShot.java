package fr.greweb.reactnativeviewshot;

import javax.annotation.Nullable;
import android.graphics.Bitmap;
import android.net.Uri;
import android.util.Base64;
import android.view.View;

import com.facebook.react.bridge.Promise;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Snapshot utility class allow to screenshot a view.
 */
public class ViewShot implements UIBlock {

    static final String ERROR_UNABLE_TO_SNAPSHOT = "E_UNABLE_TO_SNAPSHOT";

    private int tag;
    private Bitmap.CompressFormat format;
    private double quality;
    private Integer width;
    private Integer height;
    private File output;
    private boolean base64;
    private Promise promise;

    public ViewShot(
            int tag,
            Bitmap.CompressFormat format,
            double quality,
            @Nullable Integer width,
            @Nullable Integer height,
            File output,
            boolean base64,
            Promise promise) {
        this.tag = tag;
        this.format = format;
        this.quality = quality;
        this.width = width;
        this.height = height;
        this.output = output;
        this.base64 = base64;
        this.promise = promise;
    }

    @Override
    public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        OutputStream os = null;
        View view = nativeViewHierarchyManager.resolveView(tag);
        try {
            if (base64) {
                os = new ByteArrayOutputStream();
                captureView(view, os);
                byte[] bytes = ((ByteArrayOutputStream) os).toByteArray();
                String data = Base64.encodeToString(bytes, Base64.NO_WRAP);
                promise.resolve(data);
            } else {
                os = new FileOutputStream(output);
                captureView(view, os);
                String uri = Uri.fromFile(output).toString();
                promise.resolve(uri);
            }
        }
        catch (Exception e) {
            promise.reject(ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag "+tag);
        }
        finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Screenshot a view and return the captured bitmap.
     * @param view the view to capture
     * @return the screenshot or null if it failed.
     */
    private void captureView (View view, OutputStream os) {
        int w = view.getWidth();
        int h = view.getHeight();
        if (w <= 0 || h <= 0) {
            throw new RuntimeException("Impossible to snapshot the view: view is invalid");
        }
        if (!view.isDrawingCacheEnabled())
          view.setDrawingCacheEnabled(true);

        Bitmap bitmap = view.getDrawingCache();

        if (width != null && height != null && (width != w || height != h)) {
            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
        }
        if (bitmap == null) {
            throw new RuntimeException("Impossible to snapshot the view");
        }
        bitmap.compress(format, (int)(100.0 * quality), os);
        view.setDrawingCacheEnabled(false);
    }
}
