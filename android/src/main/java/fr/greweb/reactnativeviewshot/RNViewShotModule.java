
package fr.greweb.reactnativeviewshot;

import android.app.Activity;
import android.content.Context;
import androidx.annotation.NonNull;

import android.net.Uri;
import android.util.DisplayMetrics;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.UIManagerModule;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import fr.greweb.reactnativeviewshot.ViewShot.Formats;
import fr.greweb.reactnativeviewshot.ViewShot.Results;

public class RNViewShotModule extends ReactContextBaseJavaModule {

    public static final String RNVIEW_SHOT = "RNViewShot";

    private final ReactApplicationContext reactContext;

    public RNViewShotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return RNVIEW_SHOT;
    }

    @Override
    public Map<String, Object> getConstants() {
        return Collections.emptyMap();
    }

    @ReactMethod
    public void releaseCapture(String uri) {
        final String path = Uri.parse(uri).getPath();
        if (path == null) return;
        File file = new File(path);
        if (!file.exists()) return;
        file.delete();
    }

    @ReactMethod
    public void captureRef(int tag, ReadableMap options, Promise promise) {
        final ReactApplicationContext context = getReactApplicationContext();
        final DisplayMetrics dm = context.getResources().getDisplayMetrics();

        String extension = options.getString("format");
        if (extension == null) {
            extension = "jpg";
        }
        final int imageFormat = "jpg".equals(extension)
                ? Formats.JPEG
                : "webm".equals(extension)
                ? Formats.WEBP
                : "raw".equals(extension)
                ? Formats.RAW
                : Formats.PNG;

        final double quality = options.getDouble("quality");
        final Integer scaleWidth = options.hasKey("width") ? (int) (dm.density * options.getDouble("width")) : null;
        final Integer scaleHeight = options.hasKey("height") ? (int) (dm.density * options.getDouble("height")) : null;
        final String resultStreamFormat = options.getString("result");
        final Boolean snapshotContentContainer = options.getBoolean("snapshotContentContainer");
        final String path = options.getString("path");

        try {
            File outputFile = null;
            if (Results.FILE.equals(resultStreamFormat)) {
                if (path == null || path.isEmpty()) {
                    outputFile = createTempFile(getReactApplicationContext(), extension);
                } else {
                    outputFile = new File(path);
                }
            }

            final Activity activity = getCurrentActivity();
            final UIManagerModule uiManager = this.reactContext.getNativeModule(UIManagerModule.class);

            if (uiManager != null) {
                uiManager.addUIBlock(new ViewShot(
                        tag, extension, imageFormat, quality,
                        scaleWidth, scaleHeight, outputFile, resultStreamFormat,
                        snapshotContentContainer, reactContext, activity, promise)
                );
            }
        } catch (final Throwable ex) {
            Log.e(RNVIEW_SHOT, "Failed to snapshot view tag " + tag, ex);
            promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag " + tag);
        }
    }

    @ReactMethod
    public void captureScreen(ReadableMap options, Promise promise) {
        captureRef(-1, options, promise);
    }

    private static final String TEMP_FILE_PREFIX = "react-native-view-shot";

    /**
     * Create a temporary file in the cache directory.
     */
    @NonNull
    private File createTempFile(@NonNull final Context context, @NonNull final String ext) throws IOException {
        final File cacheDir = context.getCacheDir();

        final String suffix = "." + ext;
        return File.createTempFile(TEMP_FILE_PREFIX, suffix, cacheDir);
    }
}
