package fr.greweb.reactnativeviewshot;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.net.Uri;
import android.util.Base64;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.ScrollView;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.UIBlock;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nullable;

/**
 * Snapshot utility class allow to screenshot a view.
 */
public class ViewShot implements UIBlock {


    static final String TAG = ViewShot.class.getSimpleName();

    static final String ERROR_UNABLE_TO_SNAPSHOT = "E_UNABLE_TO_SNAPSHOT";

    private int tag;
    private String extension;
    private Bitmap.CompressFormat format;
    private double quality;
    private Integer width;
    private Integer height;
    private File output;
    private String result;
    private Promise promise;
    private Boolean snapshotContentContainer;
    private  ReactApplicationContext reactContext;
    private Activity currentActivity;

    public ViewShot(
            int tag,
            String extension,
            Bitmap.CompressFormat format,
            double quality,
            @Nullable Integer width,
            @Nullable Integer height,
            File output,
            String result,
            Boolean snapshotContentContainer,
            ReactApplicationContext reactContext,
            Activity currentActivity,
            Promise promise) {
        this.tag = tag;
        this.extension = extension;
        this.format = format;
        this.quality = quality;
        this.width = width;
        this.height = height;
        this.output = output;
        this.result = result;
        this.snapshotContentContainer = snapshotContentContainer;
        this.reactContext = reactContext;
        this.currentActivity = currentActivity;
        this.promise = promise;
    }

    @Override
    public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        OutputStream os = null;
        View view = null;
        if (tag == -1) {
            view = currentActivity.getWindow().getDecorView().findViewById(android.R.id.content);
        } else {
            view = nativeViewHierarchyManager.resolveView(tag);
        }

        if (view == null) {
            promise.reject(ERROR_UNABLE_TO_SNAPSHOT, "No view found with reactTag: "+tag);
            return;
        }
        try {
            if ("tmpfile".equals(result)) {
                os = new FileOutputStream(output);
                captureView(view, os);
                String uri = Uri.fromFile(output).toString();
                promise.resolve(uri);
            }
            else if ("base64".equals(result)) {
                os = new ByteArrayOutputStream();
                captureView(view, os);
                byte[] bytes = ((ByteArrayOutputStream) os).toByteArray();
                String data = Base64.encodeToString(bytes, Base64.NO_WRAP);
                promise.resolve(data);
            }
            else if ("data-uri".equals(result)) {
                os = new ByteArrayOutputStream();
                captureView(view, os);
                byte[] bytes = ((ByteArrayOutputStream) os).toByteArray();
                String data = Base64.encodeToString(bytes, Base64.NO_WRAP);
                data = "data:image/"+extension+";base64," + data;
                promise.resolve(data);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            promise.reject(ERROR_UNABLE_TO_SNAPSHOT, "Failed to capture view snapshot");
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

    private List<View> getAllChildren(View v) {

        if (!(v instanceof ViewGroup)) {
            ArrayList<View> viewArrayList = new ArrayList<View>();
            viewArrayList.add(v);
            return viewArrayList;
        }

        ArrayList<View> result = new ArrayList<View>();

        ViewGroup viewGroup = (ViewGroup) v;
        for (int i = 0; i < viewGroup.getChildCount(); i++) {

            View child = viewGroup.getChildAt(i);

            //Do not add any parents, just add child elements
            result.addAll(getAllChildren(child));
        }
        return result;
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

        //evaluate real height
        if (snapshotContentContainer) {
            h=0;
            ScrollView scrollView = (ScrollView)view;
            for (int i = 0; i < scrollView.getChildCount(); i++) {
                h += scrollView.getChildAt(i).getHeight();
            }
        }
        Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Bitmap childBitmapBuffer;
        Canvas c = new Canvas(bitmap);
        view.draw(c);

        //after view is drawn, go through children
        List<View> childrenList = getAllChildren(view);

        for (View child : childrenList) {
            if(child instanceof TextureView) {

                int[] pos = getViewLocationInViewGroup(child, (ViewGroup) view);

                ((TextureView) child).setOpaque(false);
                childBitmapBuffer = ((TextureView) child).getBitmap(child.getWidth(), child.getHeight());
                c.drawBitmap(childBitmapBuffer, pos[0] + child.getPaddingLeft(), pos[1] + child.getPaddingTop(), null);
//                        child.getLeft() + ((ViewGroup)child.getParent()).getLeft() +  child.getPaddingLeft(),
//                        child.getTop() + ((ViewGroup)child.getParent()).getTop() + child.getPaddingTop(), null);
            }
        }

        if (width != null && height != null && (width != w || height != h)) {
            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
        }
        if (bitmap == null) {
            throw new RuntimeException("Impossible to snapshot the view");
        }
        bitmap.compress(format, (int)(100.0 * quality), os);
    }

    /**
     * Get the position of view in other parent View
     * @param view View
     * @param viewGroup  parent or ancestral
     * @return  position of view in viewGroup
     */
    private static int[] getViewLocationInViewGroup(View view, ViewGroup viewGroup) {
        if (view == null || viewGroup == null) {
            return null;
        }

        int[] position = new int[2];
        position[0] = position[1] = 0;

        for (ViewParent viewParent = view.getParent();
             viewParent != null && viewParent instanceof View;
             viewParent = view.getParent()) {

            // 当前View在当前父View的位置
            position[0] += view.getLeft();
            position[1] += view.getTop();

            view = (View) viewParent;

            // 获取父View的scroll
            position[0] -= view.getScrollX();
            position[1] -= view.getScrollY();

            if (view == viewGroup) {
                return position;
            }
        }
        return  null;
    }
}

