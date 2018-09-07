
package fr.greweb.reactnativeviewshot;

import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.GuardedAsyncTask;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;

import java.io.File;
import java.io.FilenameFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class RNViewShotModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNViewShotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNViewShot";
    }

    @Override
    public Map<String, Object> getConstants() {
        return Collections.emptyMap();
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        new CleanTask(getReactApplicationContext()).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void releaseCapture(String uri) {
        final String path = Uri.parse(uri).getPath();
        if (path == null) return;
        File file = new File(path);
        if (!file.exists()) return;
        File parent = file.getParentFile();
        if (parent.equals(reactContext.getExternalCacheDir()) || parent.equals(reactContext.getCacheDir())) {
            file.delete();
        }
    }

    @ReactMethod
    public void captureRef(int tag, ReadableMap options, Promise promise) {
        ReactApplicationContext context = getReactApplicationContext();
        String format = options.getString("format");
        Bitmap.CompressFormat compressFormat =
          format.equals("jpg")
          ? Bitmap.CompressFormat.JPEG
          : format.equals("webm")
          ? Bitmap.CompressFormat.WEBP
          : Bitmap.CompressFormat.PNG;
        double quality = options.getDouble("quality");
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        Integer width = options.hasKey("width") ? (int)(displayMetrics.density * options.getDouble("width")) : null;
        Integer height = options.hasKey("height") ? (int)(displayMetrics.density * options.getDouble("height")) : null;
        String result = options.getString("result");
        Boolean snapshotContentContainer = options.getBoolean("snapshotContentContainer");
        try {
            File file = null;
            file = createTempFile(getReactApplicationContext(), format);
            UIManagerModule uiManager = this.reactContext.getNativeModule(UIManagerModule.class);
            uiManager.addUIBlock(new ViewShot(tag, format, compressFormat, quality, width, height, file, result, snapshotContentContainer,reactContext, getCurrentActivity(), promise));
        }
        catch (Exception e) {
            promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag "+tag);
        }
    }

    @ReactMethod
    public void captureScreen(ReadableMap options, Promise promise) {
        captureRef(-1, options, promise);
    }

    private static final String TEMP_FILE_PREFIX = "ReactNative-snapshot-image";

    /**
     * Asynchronous task that cleans up cache dirs (internal and, if available, external) of cropped
     * image files. This is run when the catalyst instance is being destroyed (i.e. app is shutting
     * down) and when the module is instantiated, to handle the case where the app crashed.
     */
    private static class CleanTask extends GuardedAsyncTask<Void, Void> {
        private final Context mContext;

        private CleanTask(ReactContext context) {
            super(context);
            mContext = context;
        }

        @Override
        protected void doInBackgroundGuarded(Void... params) {
            cleanDirectory(mContext.getCacheDir());
            File externalCacheDir = mContext.getExternalCacheDir();
            if (externalCacheDir != null) {
                cleanDirectory(externalCacheDir);
            }
        }

        private void cleanDirectory(File directory) {
            File[] toDelete = directory.listFiles(
                    new FilenameFilter() {
                        @Override
                        public boolean accept(File dir, String filename) {
                            return filename.startsWith(TEMP_FILE_PREFIX);
                        }
                    });
            if (toDelete != null) {
                for (File file: toDelete) {
                    file.delete();
                }
            }
        }
    }

    /**
     * Create a temporary file in the internal cache directory.
     */
    private File createTempFile(Context context, String ext)
            throws IOException {
        File cacheDir = context.getCacheDir();
        String suffix = "." + ext;
        File tmpFile = File.createTempFile(TEMP_FILE_PREFIX, suffix, cacheDir);
        return tmpFile;
    }

}
