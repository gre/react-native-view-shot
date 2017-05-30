
package fr.greweb.reactnativeviewshot;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.view.View;
//add 
import android.content.Intent;
import android.net.Uri;

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
        return getSystemFolders(this.getReactApplicationContext());
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        new CleanTask(getReactApplicationContext()).executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void takeSnapshot(int tag, ReadableMap options, Promise promise) {
        ReactApplicationContext context = getReactApplicationContext();
        String format = options.hasKey("format") ? options.getString("format") : "png";
        Bitmap.CompressFormat compressFormat =
                format.equals("png")
                        ? Bitmap.CompressFormat.PNG
                        : format.equals("jpg")||format.equals("jpeg")
                        ? Bitmap.CompressFormat.JPEG
                        : format.equals("webm")
                        ? Bitmap.CompressFormat.WEBP
                        : null;
        if (compressFormat == null) {
            promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Unsupported image format: "+format+". Try one of: png | jpg | jpeg");
            return;
        }
        double quality = options.hasKey("quality") ? options.getDouble("quality") : 1.0;
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        Integer width = options.hasKey("width") ? (int)(displayMetrics.density * options.getDouble("width")) : null;
        Integer height = options.hasKey("height") ? (int)(displayMetrics.density * options.getDouble("height")) : null;
        String result = options.hasKey("result") ? options.getString("result") : "file";
        Boolean snapshotContentContainer = options.hasKey("snapshotContentContainer") ? options.getBoolean("snapshotContentContainer") : false;
        try {
            File file = null;
            if ("file".equals(result)) {
                if (options.hasKey("path")) {
                    file = new File(options.getString("path"));
                    file.getParentFile().mkdirs();
                    file.createNewFile();
                }
                else {
                    file = createTempFile(getReactApplicationContext(), format);
                }
            }
            UIManagerModule uiManager = this.reactContext.getNativeModule(UIManagerModule.class);
            uiManager.addUIBlock(new ViewShot(tag, format, compressFormat, quality, width, height, file, result, snapshotContentContainer, promise));
         //add by aqnaruto liaoyiheng 
            Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
            Uri contentUri = Uri.fromFile(file);
            mediaScanIntent.setData(contentUri);
            getReactApplicationContext().sendBroadcast(mediaScanIntent);
        }
        catch (Exception e) {
            promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag "+tag);
        }
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

    static private Map<String, Object> getSystemFolders(ReactApplicationContext ctx) {
        Map<String, Object> res = new HashMap<>();
        res.put("CacheDir", ctx.getCacheDir().getAbsolutePath());
        res.put("DCIMDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM).getAbsolutePath());
        res.put("DocumentDir", ctx.getFilesDir().getAbsolutePath());
        res.put("DownloadDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath());
        res.put("MainBundleDir", ctx.getApplicationInfo().dataDir);
        res.put("MovieDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES).getAbsolutePath());
        res.put("MusicDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC).getAbsolutePath());
        res.put("PictureDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).getAbsolutePath());
        res.put("RingtoneDir", Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_RINGTONES).getAbsolutePath());
        String state;
        state = Environment.getExternalStorageState();
        if (state.equals(Environment.MEDIA_MOUNTED)) {
            res.put("SDCardDir", Environment.getExternalStorageDirectory().getAbsolutePath());
        }
        return res;
    }

    /**
     * Create a temporary file in the cache directory on either internal or external storage,
     * whichever is available and has more free space.
     */
    private File createTempFile(Context context, String ext)
            throws IOException {
        File externalCacheDir = context.getExternalCacheDir();
        File internalCacheDir = context.getCacheDir();
        File cacheDir;
        if (externalCacheDir == null && internalCacheDir == null) {
            throw new IOException("No cache directory available");
        }
        if (externalCacheDir == null) {
            cacheDir = internalCacheDir;
        }
        else if (internalCacheDir == null) {
            cacheDir = externalCacheDir;
        } else {
            cacheDir = externalCacheDir.getFreeSpace() > internalCacheDir.getFreeSpace() ?
                    externalCacheDir : internalCacheDir;
        }
        String suffix = "." + ext;
        File tmpFile = File.createTempFile(TEMP_FILE_PREFIX, suffix, cacheDir);
        return tmpFile;
    }

}
